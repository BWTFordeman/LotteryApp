import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [selectedCircles, setSelectedCircles] = useState([]);
  const [boughtCircles, setBoughtCircles] = useState([]);

  // Select ticket.
  const handleCircleClick = (circleNumber) => {
    // Check if the circle has been bought
    if (boughtCircles.includes(circleNumber)) {
      return;
    }

    if (selectedCircles.includes(circleNumber)) {
      setSelectedCircles(selectedCircles.filter((num) => num !== circleNumber));
    } else {
      setSelectedCircles([...selectedCircles, circleNumber]);
    }
  };

  // Buy tickets that are selected.
  const handleBuyClick = () => {
    const nextFriday = getNextFriday();
    const nextFridayDate = nextFriday.toISOString().split('T')[0];

    const selectedTickets = selectedCircles.map((circleNumber) => ({
      buyerName: userName,
      ticketDate: nextFridayDate,
      ticketNumber: circleNumber,
    }));
  
    if (selectedTickets.length === 0) {
      return;
    }
    // Send a POST request to your API
    fetch("http://localhost:8080/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedTickets),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Tickets purchased successfully!");
          setSelectedCircles([]);
          setBoughtCircles((prevBoughtCircles) => [
            ...prevBoughtCircles,
            ...selectedCircles,
          ]);
        } else {
          console.error("Failed to purchase tickets.");
        }
      })
      .catch((error) => {
        console.error("An error occurred:", error);
      });
  };

  // Get data of tickets bought:
  useEffect(() => {
    const apiUrl = 'http://localhost:8080/tickets?ticketDate=2023-12-01';

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setIsLoading(false);

        setBoughtCircles([4, 6])
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Generate an array of circles with numbers 1-100
  const circles = Array.from({ length: 100 }, (_, index) => index + 1);

  // Split circles into groups of 10 for wrapping
  const circleGroups = [];
  for (let i = 0; i < circles.length; i += 10) {
    circleGroups.push(circles.slice(i, i + 10));
  }

  return (
    <div className="App">
      <header className="Header">
        <h1 className="HeaderTitle">Weekly Wine Lottery</h1>
      </header>
      <div className="Main">
        <div className="CenteredBox">
          <div className="LeftBox">
            {circles.map((circleNumber) => (
              <div
                key={circleNumber}
                className={`Circle ${selectedCircles.includes(circleNumber) ? 'Selected' : ''
                  } ${boughtCircles.includes(circleNumber) ? 'Bought' : ''}`}
                onClick={() => handleCircleClick(circleNumber)}
              >
                {circleNumber}
              </div>
            ))}
          </div>
          <div className="VerticalLine"></div>
          <div className="RightBox">
            <h2>Selected tickets</h2>
            <div className="SelectedCircles">
              {selectedCircles.map((selectedCircle) => (
                <div
                  key={selectedCircle}
                  className="SelectedCircle"
                  onClick={() => handleCircleClick(selectedCircle)} // Add click handler if needed
                >
                  {selectedCircle}
                </div>
              ))}
            </div>
            <div className="NameInput">
              <input
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
              <button className="BuyButton" onClick={handleBuyClick}>
                Buy
              </button>
            </div>
          </div>
        </div>
      </div>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.buyerName} {item.ticketNumber}</li>
        ))}
      </ul>
    </div>
  );
}

function getNextFriday() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilNextFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 5 + (7 - dayOfWeek);
  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + daysUntilNextFriday);
  return nextFriday;
}

export default App;
