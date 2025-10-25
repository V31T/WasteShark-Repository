const axios = require("axios");

async function testUpdateStatus() {
  try {
    const response = await axios.post("http://localhost:3000/api/users/updatestatus", {
      status: "active",
    });
    console.log("Response:", response.data);
  } catch (error) {
    // Log more details for debugging if needed
    if (error.response) {
      console.error("Error:", error.response.status, error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

testUpdateStatus();