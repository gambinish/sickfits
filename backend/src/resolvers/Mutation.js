const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// below is for password reset workflow. both are built in node libraries
const { randomBytes } = require('crypto');
const { promisify } = require('util');
// import email functions from mail.js
const { transport, emailTemplate } = require('../mail');
const { hasPermission } = require('../utils');

const maxCookieAge = 1000 * 60 * 60 * 24 * 365; // 1 year cookie


const Mutations = {

  // CRUD FLOW

  async createItem(parent, args, ctx, info) {
    // TODO: check if they are logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that!')
    }
    // ctx context defined in createServer.js
    const item = await ctx.db.mutation.createItem({
      data: {
        // this is how we create a relationship between the item and the user
        user: {
          connect: {
            id: ctx.request.userId,
          },
        },
        ...args,
      },
    }, info);

    return item;
  },
  updateItem(parent, args, ctx, info) {
    // take copy of updates
    const updates = { ...args };
    // remove id from updates
    delete updates.id;
    // run update logic
    return ctx.db.mutation.updateItem({
      data: updates,
      where: {
        id: args.id,
      },
    }, info);
  },
  async deleteItem(parent, args, ctx, info) {
    // throw new Error('You do not have the correct permissions')
    const where = { id: args.id };
    // find item
    const item = await ctx.db.query.item({ where }, `{id title user { id }}`);
    // TODO check if user has owns and has permissions
    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some(permission => ['ADMIN', 'ITEMDELETE'].includes(permission));
    if (!ownsItem || !hasPermission) {
      throw new Error('You do not have the correct permissions')
    }
    // delete it
    return ctx.db.mutation.deleteItem({ where }, info);
  },

  // AUTHENTICATION FLOW

  // TODO: 
  async signUp(parent, args, ctx, info) {
    // lowercase email for sanity
    args.email = args.email.toLowerCase();
    // hash the password
    const password = await bcrypt.hash(args.password, 12);
    // create the user in the db
    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        password,
        permissions: { set: ['USER'] },
      },
    }, info);
    // create JWT token to keep them signed in
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // set cookie on response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });
    // return user to browser
    return user;
  },
  async signIn(parent, { email, password }, ctx, info) {
    // check if there is user with email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for email: ${email}`);
    }
    // check if password is correct
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error('Invalid Password');
    }
    // generate jwt
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // set cookie with jwt token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: maxCookieAge,
    })
    // return user
    return user;
  },
  async signOut(parent, args, ctx, info) {
    // this comes from cookiesParser library
    ctx.response.clearCookie('token');
    return { message: 'Goodbye!' };
  },

  // PASSWORD RESET FLOW

  async requestReset(parent, args, ctx, info) {
    // check if the user exists
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error(`No such user found for email: ${args.email}`);
    }
    // set a reset token and expiry to user
    const randomBytesPromise = promisify(randomBytes);
    const resetToken = (await randomBytesPromise(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });
    // email user the reset token
    const mailRes = await transport.sendMail({
      from: 'ngambino0192@gmail.com',
      to: user.email,
      subject: 'Your Password Reset Token',
      html: emailTemplate(`
      Your Password Reset Token is here! 
      \n\n 
      <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset</a>
      `)
    })

    // return the message
    return { message: 'Thanks!' }
  },

  async resetPassword(parent, args, ctx, info) {
    // check if the passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error('Passwords do not match')
    }
    // check if its a legit reset token
    // using 'users' as in datamodel, we are given many more methods to use, not only unique inputs of 'user'
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      },
    });
    // check if its expired
    if (!user) {
      throw new Error('This token is either invalid or expired');
    }
    // hash the new password
    const password = await bcrypt.hash(args.password, 12);
    // save new password to user and remove old resetToken fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    })
    // generate jwt
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    // set the jwt cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: maxCookieAge
    })
    // return the new user
    return updatedUser;
  },
  async updatePermissions(parent, args, ctx, info) {
    // check if they are logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!')
    }
    // query the current suer
    const currentUser = await ctx.db.query.user({
      where: {
        id: ctx.request.userId,
      },
    },
      info
    );
    // check if they have permissions to do this
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']
    );
    // update the permissions
    return ctx.db.mutation.updateUser({
      data: {
        permissions: {
          // use set because permissions is a custom enum...this is from prisma library
          set: args.permissions,
        },
      },
      where: {
        id: args.userId,
      }
    }, info)
  }
};

module.exports = Mutations;
