
const express = require('express');
const bodyParser = require('body-parser');
const aws = require('aws-sdk');
const ejs = require('ejs'); // Add this line

const app = express();
const port = 3000;

// Configure AWS SDK
aws.config.update({
  accessKeyId: 'AKIA2JOAR7PJ7AMNYFUX',
  secretAccessKey: 'aqS0J53puOg84l6DcSOqAGSbqtgD/WqZ/xt8kMon',
  region: 'us-east-1', // Change to your desired AWS region
});

// Set up bodyParser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve HTML page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Serve trackEvent.html
app.get('/trackEvent', (req, res) => {
    res.sendFile(__dirname + '/trackEvent.html');
  });

const items = require('./items.json'); 

// Handle recommendation request
app.post('/recommend', (req, res) => {
    const userId = req.body.userId;
    const itemId = req.body.itemId;
  
    // Use Amazon Personalize API to get recommendations (example: get_recommendations)
    const personalizeRuntime = new aws.PersonalizeRuntime();
  
    // Replace 'get_recommendations' with the appropriate API call for getting recommendations
    const params = {
      campaignArn: 'arn:aws:personalize:us-east-1:707462822867:campaign/item-recommendation-main-campaign', // Replace with your actual campaign ARN
      userId: userId,
      itemId: itemId,
      numResults: 5, // Number of recommendations to retrieve
    };
  
    personalizeRuntime.getRecommendations(params, (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error fetching recommendations');
        } else {
        // Process API response and send recommendations with item details to the client
        const recommendedItems = data.itemList.map(item => {
          const itemInfo = items.find(i => i.item_ID === item.itemId);
          return {
            item_ID: item.itemId,
            title: itemInfo ? itemInfo.title : 'Title not available',
            artist: itemInfo ? itemInfo.artist : 'Artist not available',
            style: itemInfo ? itemInfo.style : 'Style not available',
            genre: itemInfo ? itemInfo.genre : 'Genre not available',
            material: itemInfo ? itemInfo.material : 'Material not available',
            date: itemInfo ? itemInfo.date : 'Date not available',
          };
        });
  
        res.json({ recommendedItems });
      }
    });
  });



// Handle request for more contents recommendations
app.post('/recommendMoreContents', (req, res) => {
    console.log('Received items request')
  const itemId = req.body.itemId;

  // Use Amazon Personalize API to get recommendations for "more contents"
  const personalizeRuntime = new aws.PersonalizeRuntime();

  // Replace 'get_recommendations' with the appropriate API call for getting recommendations
  const params = {
    campaignArn: 'arn:aws:personalize:us-east-1:707462822867:campaign/item-recommendation-content-based-campaign', // Replace with your other campaign ARN
    itemId: itemId,
    numResults: 5, // Number of recommendations to retrieve
  };

  personalizeRuntime.getRecommendations(params, (err, data) => {
    if (err) {
      console.error('Error',err);
      res.status(500).send('Error fetching more contents recommendations');
    } else {
      // Process API response and send recommendations to the client
      const recommendedItems = data.itemList.map(item => {
        const itemInfo = items.find(i => i.item_ID === item.itemId);
        return {
            item_ID: item.itemId,
            title: itemInfo ? itemInfo.title : 'Title not available',
            artist: itemInfo ? itemInfo.artist : 'Artist not available',
            style: itemInfo ? itemInfo.style : 'Style not available',
            genre: itemInfo ? itemInfo.genre : 'Genre not available',
            material: itemInfo ? itemInfo.material : 'Material not available',
            date: itemInfo ? itemInfo.date : 'Date not available',
        };
      });

      res.json({ recommendedItems });
    }
  });
});



// Handle tracking events
app.post('/trackEvent', (req, res) => {
    const userId = req.body.userId;
    const itemId = req.body.itemId;
    const sentAt = req.body.sentAt;
    const eventType = req.body.eventType;
    const sessionId = req.body.sessionId;
    const eventId = req.body.eventId;
    const properties = req.body.properties; // Check the properties field
  
    console.log('Received tracking event request:', req.body);
  
    // Use Amazon Personalize API to track events
    const personalizeEvents = new aws.PersonalizeEvents();
  
    // Replace 'putEvents' with the appropriate API call for tracking events
    const params = {
      trackingId: 'aaae271a-1aec-441f-8787-53d9e85e302b', // Replace with your tracking ID
      userId: userId,
      sessionId: sessionId,
      eventList: [
        {
          eventId: eventId,
          sentAt: sentAt,
          eventType: eventType,
          properties: properties,
        },
      ],
    };
  
    personalizeEvents.putEvents(params, (err, data) => {
      if (err) {
        console.error('Error tracking event:', err);
        res.status(500).json({ error: 'Error tracking event' });
      } else {
        console.log('Event tracked successfully:', data);
        res.json({ success: true });
      }
    });
  });


// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
