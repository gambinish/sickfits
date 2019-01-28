const Mutations = {
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
  }
};

module.exports = Mutations;
