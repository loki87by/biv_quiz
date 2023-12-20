import React, { useState, useEffect } from "react";
import './app.css'

const App = () => {
  const [username, setUsername] = useState("");
  const [timerCounter, setTimerCounter] = useState(30);
  const [isAuthorized, setAuthorized] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [inputError, setInputError] = useState(false);
  const [duplicateNameError, setDuplicateNameError] = useState(false);

  function inputHandler(val) {

    setInputError(false)
    setDuplicateNameError(false)
    const regex = /[а-яА-ЯёЁ\s]*/gi

    if (val !== val.match(regex).join("")) {
      setInputError(true)
    };
    setUsername(val.match(regex).join(""))
  }

  useEffect(() => {

    if (timerStarted && timerCounter > 0) {
    const timer = setInterval(() => {
        const value = timerCounter - 1;
        setTimerCounter(value);
    }, 1000);
    return () => {clearInterval(timer)};
  }
  }, [timerCounter, timerStarted]);

  const handleButtonClick = () => {
    let data;

    if (!isAuthorized) {
      data = {
        type: "register",
        username: username,
      };
    } else {
      data = {
        type: "disabled",
        username: username,
      };
    }

    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      ws.send(JSON.stringify(data));
      ws.onmessage = (event) => {
        console.log(JSON.parse(event.data));

        if (JSON.parse(event.data).type === "success") {
          setAuthorized(true);
        }

        if (JSON.parse(event.data).type === "failure") {
          setDuplicateNameError(true)
        }

        if (
          JSON.parse(event.data).type === "stateChange" &&
          JSON.parse(event.data).state === "disabled"
        ) {
          setButtonDisabled(true);
          setTimerStarted(true)
        }
      };
    };
  };

  return (
    <section>
      {!isAuthorized ? (
        <div>
        <input
          type="text"
          placeholder="Введите имя"
          value={username}
          id="name"
          onChange={(e) => {
            inputHandler(e.target.value)
          }}
        /><label htmlFor="name">
        {duplicateNameError ? "Имя уже занято" : inputError ? 'Используй кириллицу' : ''}
      </label>
        </div>
      ) : (
        ''
      )}
      <button
        disabled={buttonDisabled}
        onClick={handleButtonClick}
        className={`${!isAuthorized && "green-button"}`}
      >
        {!isAuthorized ? "Join" : buttonDisabled ? timerCounter : "Ready"}
      </button>
    </section>
  );
};

export default App;
