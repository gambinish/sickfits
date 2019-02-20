const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Mutations = {

  // CRUD FLOW

  async createItem(parent, args, ctx, info) {
    // TODO: check if they are logged in
    // ctx context defined in createServer.js
    // returns a promise
    const item = await ctx.db.mutation.createItem({
      data: {
        ...args
      }
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
    const where = { id: args.id };
    // find item
    const item = await ctx.db.query.item({ where }, `{id title}`);
    // TODO check if user has owns and has permissions
    // delete it
    return ctx.db.mutation.deleteItem({ where }, info);
  },

  // SIGN UP AUTHENTICATION FLOW


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
      maxAge: 1000 * 60 * 60 * 24 * 365,
    })
    // return user
    return user;
  },
  async signOut(parent, args, ctx, info) {
    // this comes from cookiesParser library
    ctx.response.clearCookie('token');
    return { message: 'Goodby!' };
  }

};

module.exports = Mutations;
