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
  }
};

module.exports = Mutations;
