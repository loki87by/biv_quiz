import React, { useState, useEffect } from "react";
import './app.css'

const App = () => {
  const [username, setUsername] = useState("");
  const [timerCounter, setTimerCounter] = useState(30);
  const [isAuthorized, setAuthorized] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [inputError, setInputError] = useState(false);

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
          alert("логин уже занят");
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
    <>
      {!isAuthorized ? (
        <div>
        <input
          type="text"
          placeholder="Введите имя"
          value={username}
          id="name"
          onChange={(e) => {
            setInputError(false)
            const regex = /[а-яА-ЯёЁ\s]*/gi
            if (e.target.value !== e.target.value.match(regex).join("")) {
              setInputError(true)
            };
            setUsername(e.target.value.match(regex).join(""))}}
        /><label htmlFor="name">
        {inputError ? 'Используй кириллицу' : ''}
      </label>
        </div>
      ) : (
        <h1>{''}</h1>
      )}
      <button
        disabled={buttonDisabled}
        onClick={handleButtonClick}
      >
        {!isAuthorized ? "Присоединиться" : buttonDisabled ? timerCounter : "Ответ"}
      </button>
    </>
  );
};

export default App;
