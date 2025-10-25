const axios = require("axios");

async function testUpdateStatus() {
  try {
    const response = await axios.post("http://localhost:3000/updatestatus", {
      status: "active",
    });
    console.log("Response:", response.data);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testUpdateStatus();
