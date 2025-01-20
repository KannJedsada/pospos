// socketHandler.js
module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected");

    // ฟัง Event "cartUpdated" และกระจายข้อมูลไปยัง client อื่น
    socket.on("cartUpdated", (updatedCarts) => {
      console.log("Cart updated:", updatedCarts);
      socket.broadcast.emit("cartUpdated", updatedCarts); // ส่งข้อมูลไปยัง client อื่น
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};
