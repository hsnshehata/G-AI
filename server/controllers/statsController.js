const Stat = require('../models/Stat');
const Chat = require('../models/Chat');

exports.getStatsSummary = async (req, res) => {
  const { botId, period = 'week' } = req.query;

  try {
    // Validate input
    if (!botId) {
      return res.status(400).json({ error: 'botId is required' });
    }

    // Restrict access: Superadmin can see all, admin can only see their own stats
    if (req.user.role !== 'superadmin' && req.user.pageId !== botId) {
      return res.status(403).json({ error: 'Unauthorized access to these stats' });
    }

    // Calculate date range
    const startDate = new Date();
    if (period === 'day') startDate.setDate(startDate.getDate() - 1);
    else if (period === 'week') startDate.setDate(startDate.getDate() - 7);
    else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);

    // Fetch stats from Stat model
    const stats = await Stat.find({
      botId,
      date: { $gte: startDate.toISOString().split('T')[0] },
    });

    // Fetch chats for response rate
    const chats = await Chat.find({
      pageId: botId,
      'messages.timestamp': { $gte: startDate },
    });

    // Calculate aggregated stats
    const ratingsCount = stats.reduce((acc, s) => acc + s.count, 0);
    const performance = stats.reduce((acc, s) => ({
      ...acc,
      [s.source]: (acc[s.source] || 0) + s.count,
    }), {});

    const totalMessages = chats.reduce((sum, chat) => sum + chat.messages.length, 0);
    const respondedMessages = chats.reduce((sum, chat) => sum + chat.messages.filter(m => m.responded).length, 0);
    const responseRate = totalMessages ? (respondedMessages / totalMessages * 100).toFixed(2) : 0;

    res.json({
      ratings: ratingsCount,
      performance,
      responseRate,
      period,
    });
  } catch (err) {
    console.error(`❌ Error fetching stats: ${err.message}`);
    res.status(500).json({ error: `Failed to fetch stats: ${err.message}` });
  }
};

exports.exportStats = async (req, res) => {
  const { botId, period = 'week' } = req.query;

  try {
    // Validate input
    if (!botId) {
      return res.status(400).json({ error: 'botId is required' });
    }

    // Restrict access
    if (req.user.role !== 'superadmin' && req.user.pageId !== botId) {
      return res.status(403).json({ error: 'Unauthorized access to these stats' });
    }

    // Calculate date range
    const startDate = new Date();
    if (period === 'day') startDate.setDate(startDate.getDate() - 1);
    else if (period === 'week') startDate.setDate(startDate.getDate() - 7);
    else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);

    // Fetch stats
    const stats = await Stat.find({
      botId,
      date: { $gte: startDate.toISOString().split('T')[0] },
    });
    const chats = await Chat.find({
      pageId: botId,
      'messages.timestamp': { $gte: startDate },
    });

    // Calculate aggregated stats
    const totalMessages = chats.reduce((sum, chat) => sum + chat.messages.length, 0);
    const respondedMessages = chats.reduce((sum, chat) => sum + chat.messages.filter(m => m.responded).length, 0);
    const responseRate = totalMessages ? (respondedMessages / totalMessages * 100).toFixed(2) : 0;

    // Generate CSV content
    let csv = 'Date,Source,Count,Response Rate\n';
    stats.forEach(stat => {
      csv += `${stat.date},${stat.source},${stat.count},${responseRate}%\n`;
    });
    csv += `Total Messages,${totalMessages},Responded Messages,${respondedMessages},Response Rate,${responseRate}%\n`;

    // Send CSV file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="stats_${botId}_${period}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error(`❌ Error exporting stats: ${err.message}`);
    res.status(500).json({ error: `Failed to export stats: ${err.message}` });
  }
};

module.exports = exports;