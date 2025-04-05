const { Server } = require('socket.io');
let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('⚡ WebSocket client connected');

    socket.on('disconnect', () => {
      console.log('❌ WebSocket client disconnected');
    });
  });
}

// دالة لإرسال بيانات إلى الفرونت
function emitToBotRoom(botId, event, data) {
  if (io) {
    io.to(botId).emit(event, data);
  }
}

// دالة لربط يوزر بروم معينة حسب البوت
function joinBotRoom(socket, botId) {
  socket.join(botId);
}

module.exports = {
  initSocket,
  emitToBotRoom,
  joinBotRoom,
};
