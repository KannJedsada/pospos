const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("workdateUpdated", (data) => {
      io.emit("workdateUpdated", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

module.exports = socketHandler;
