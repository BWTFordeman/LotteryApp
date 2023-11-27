import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [boughtTickets, setBoughtTickets] = useState([]);
  const [myBoughtTickets, setMyBoughtTickets] = useState([]);

  // Select ticket.
  const handleTicketClick = (ticketNumber) => {
    // Check if the ticket has been bought
    if (boughtTickets.includes(ticketNumber)) {
      return;
    }

    if (selectedTickets.includes(ticketNumber)) {
      setSelectedTickets(selectedTickets.filter((num) => num !== ticketNumber));
    } else {
      setSelectedTickets([...selectedTickets, ticketNumber]);
    }
  };

  // Buy tickets that are selected.
  const handleBuyClick = () => {
    const nextFriday = getNextFriday();

    const currentlySelectedTickets = selectedTickets.map((ticketNumber) => ({
      buyerName: userName,
      ticketDate: nextFriday,
      ticketNumber: ticketNumber,
    }));
  
    if (currentlySelectedTickets.length === 0 || userName === "") {
      return;
    }
    // Send a POST request to your API
    fetch("https://lottery-spring-api-spring-app-20231127205737.azuremicroservices.io/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(currentlySelectedTickets),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Tickets purchased successfully!");
          setSelectedTickets([]);
          setBoughtTickets((prevBoughtTickets) => [
            ...prevBoughtTickets,
            ...selectedTickets,
          ]);
          setMyBoughtTickets((prevMyBoughtTickets) => [
            ...prevMyBoughtTickets,
            ...selectedTickets,
          ]);
          setData((prevData) => [
            ...prevData,
            ...currentlySelectedTickets,
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
    const newName = e.target.value;
    setUserName(newName);

    // Filter the data array to get bought tickets with matching buyerName
    const matchingTickets = data.filter((item) => item.buyerName === newName);

    // Extract the ticket numbers from matchingTickets
    const matchingTicketNumbers = matchingTickets.map((item) => item.ticketNumber);
    setMyBoughtTickets(matchingTicketNumbers);

  }

  // Get data of tickets bought:
  useEffect(() => {
    const nextFriday = getNextFriday();
    const apiUrl = 'https://lottery-spring-api-spring-app-20231127205737.azuremicroservices.io/tickets?ticketDate=' + nextFriday;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setIsLoading(false);

        // Extract the ticket numbers from the data array
        const boughtTickets = data.map((item) => item.ticketNumber);
        setBoughtTickets(boughtTickets);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Generate an array of tickets with numbers 1-100
  const tickets = Array.from({ length: 100 }, (_, index) => index + 1);

  return (
    <div className="App">
      <header className="Header">
        <h1 className="HeaderTitle">Weekly Wine Lottery</h1>
      </header>
      <div className="Main">
        <div className="CenteredBox">
          <div className="LeftBox">
            {tickets.map((ticketNumber) => (
              <div
                key={ticketNumber}
                className={`Ticket ${selectedTickets.includes(ticketNumber) ? 'Selected' : ''
                  } ${boughtTickets.includes(ticketNumber) ? 'Bought' : ''}`}
                onClick={() => handleTicketClick(ticketNumber)}
              >
                {ticketNumber}
              </div>
            ))}
          </div>
          <div className="VerticalLine"></div>
          <div className="RightBox">
            <h2>Selected tickets</h2>
            <div className="SelectedTickets">
              {selectedTickets
              .sort((a, b) => a - b)
              .map((selectedTicket) => (
                <div
                  key={selectedTicket}
                  className="SelectedTicket"
                  onClick={() => handleTicketClick(selectedTicket)}
                >
                  {selectedTicket}
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
  // Get date:
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilNextFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 5 + (7 - dayOfWeek);
  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + daysUntilNextFriday);

  // Format date correctly:
  const year = nextFriday.getFullYear();
  const month = String(nextFriday.getMonth() + 1).padStart(2, '0');
  const day = String(nextFriday.getDate()).padStart(2, '0');
  const nextFridayDate = `${year}-${month}-${day}`;

  return nextFridayDate;
}

export default App;
