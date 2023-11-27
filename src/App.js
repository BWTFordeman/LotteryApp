import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [selectedCircles, setSelectedCircles] = useState([]);
  const [boughtCircles, setBoughtCircles] = useState([]);
  const [myBoughtTickets, setMyBoughtTickets] = useState([]);

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
    const year = nextFriday.getFullYear();
    const month = String(nextFriday.getMonth() + 1).padStart(2, '0');
    const day = String(nextFriday.getDate()).padStart(2, '0');
    const nextFridayDate = `${year}-${month}-${day}`;

    const selectedTickets = selectedCircles.map((circleNumber) => ({
      buyerName: userName,
      ticketDate: nextFridayDate,
      ticketNumber: circleNumber,
    }));
  
    if (selectedTickets.length === 0 || userName === "") {
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
          setMyBoughtTickets((prevMyBoughtCircles) => [
            ...prevMyBoughtCircles,
            ...selectedCircles,
          ]);
          setData((prevData) => [
            ...prevData,
            ...selectedTickets,
          ]);
        } else {
          console.error("Failed to purchase tickets.");
        }
      })
      .catch((error) => {
        console.error("An error occurred:", error);
      });
  };

  const handleNameInputChange = (e) => {
    setUserName(e.target.value);

    const newName = e.target.value;

    // Filter the data array to get bought tickets with matching buyerName
    const matchingTickets = data.filter((item) => item.buyerName === newName);

    // Extract the ticket numbers from matchingTickets
    const matchingTicketNumbers = matchingTickets.map((item) => item.ticketNumber);

    // Update myBoughtCircles with matching ticket numbers
    setMyBoughtTickets(matchingTicketNumbers);

  }

  // Get data of tickets bought:
  useEffect(() => {
    const apiUrl = 'http://localhost:8080/tickets?ticketDate=2023-12-01';

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setIsLoading(false);

        // Extract the ticket numbers from the data array
        const boughtCircles = data.map((item) => item.ticketNumber);
        setBoughtCircles(boughtCircles);
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
                className={`Ticket ${selectedCircles.includes(circleNumber) ? 'Selected' : ''
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
            <div className="SelectedTickets">
              {selectedCircles
              .sort((a, b) => a - b)
              .map((selectedCircle) => (
                <div
                  key={selectedCircle}
                  className="SelectedTicket"
                  onClick={() => handleCircleClick(selectedCircle)}
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
                onChange={(e) => handleNameInputChange(e)}
              />
              <button className="BuyButton" onClick={handleBuyClick}>
                Buy
              </button>
            </div>
              <h2>Tickets Bought</h2>
              <div className="BoughtTickets">
                {myBoughtTickets
                .sort((a, b) => a - b)
                .map((boughtTicket) => (
                  <div key={boughtTicket} className="BoughtTicket">
                    {boughtTicket}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
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
