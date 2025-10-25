// api/updatestatus.js
module.exports = (app, route) => {
  app.post(route, async (req, res) => {
    try {

      console.log(`Incoming POST request to ${route}`);
      
      const { status } = req.body;

      console.log("Received update status request:", status);

      // Temporary test response
      res.json({
        success: true,
        message: "Status endpoint working!",
        receivedStatus: status,
      });
    } catch (error) {
      console.error("Error in /updatestatus:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
};
