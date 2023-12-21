import React, { useState, useEffect } from "react";
import { censoredChecker } from "../utils/helpers";
import "./app.css";

const App = () => {
  const [username, setUsername] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [timerCounter, setTimerCounter] = useState(30);
  const [admin, setAdmin] = useState(false);
  const [isAuthorized, setAuthorized] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [timerStarted, setTimerStarted] = useState(false);
  const [inputError, setInputError] = useState(false);
  const [duplicateNameError, setDuplicateNameError] = useState(false);
  const [globalDisabled, setGlobalDisabled] = useState(false);

  function inputHandler(val) {
    setInputError(false);
    setDuplicateNameError(false);
    const regex = /[а-яА-ЯёЁ\s]*/gi;
    const name = censoredChecker(val);

    if (name.match(regex).join("") !== "") {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }

    if (name !== name.match(regex).join("")) {
      setInputError(true);
    }
    setUsername(name.match(regex).join(""));
  }

  useEffect(() => {
    if (timerStarted && timerCounter > 0) {
      const timer = setInterval(() => {
        const value = timerCounter - 1;
        setTimerCounter(value);
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [timerCounter, timerStarted]);

  const handleButtonClick = (reset) => {
    let data;

    if (!isAuthorized) {
      data = {
        type: "register",
        username: username,
      };
    } else {
      if (admin) {
        setTimerStarted(false);

        if (reset === "reset") {
          data = {
            type: "reset",
          };
          setTimerStarted(false);
          setTimerCounter(30);
          setCurrentUser("");
        } else {
          setGlobalDisabled(!globalDisabled);
          data = {
            type: !globalDisabled ? "disabled" : "enabled",
            username: username,
          };
          setTimerStarted(false);
          setTimerCounter(30);
        }
      } else {
        data = {
          type: "disabled",
          username: username,
        };
      }
    }

    const ws = new WebSocket("ws://178.71.32.104:8080");

    ws.onopen = () => {
      ws.send(JSON.stringify(data));
      ws.onmessage = (event) => {
        if (JSON.parse(event.data).type === "success") {
          if (username === "админ") {
            setAdmin(true);
          }
          setAuthorized(true);
        }

        if (JSON.parse(event.data).type === "reset") {
          setTimerCounter(30);
          setTimerStarted(false);
          setButtonDisabled(true);
          setGlobalDisabled(true);
          setCurrentUser("");
        }

        if (JSON.parse(event.data).type === "failure") {
          setDuplicateNameError(true);
        }

        if (JSON.parse(event.data).type === "stateChange") {
          if (
            username === "админ" &&
            JSON.parse(event.data).username !== "админ"
          ) {
            setCurrentUser(JSON.parse(event.data).username);
            setTimerStarted(true);
          } else {
            if (JSON.parse(event.data).state === "disabled") {
              setButtonDisabled(true);
            }

            if (JSON.parse(event.data).state === "enabled") {
              setButtonDisabled(false);
            }

            if (!JSON.parse(event.data).global) {
              setTimerStarted(true);
              setCurrentUser(JSON.parse(event.data).username);
            }
          }
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
              inputHandler(e.target.value);
            }}
          />
          <label htmlFor="name">
            {duplicateNameError
              ? "Имя уже занято"
              : inputError
              ? "Используй кириллицу"
              : ""}
          </label>
        </div>
      ) : (
        ""
      )}
      {currentUser !== "" ? <h2>{currentUser}</h2> : ""}
      {admin ? (
        <>
          {currentUser !== "" ? <h1>{timerCounter}</h1> : ""}
          <button onClick={handleButtonClick} className="green-button">
            {globalDisabled ? "Enable" : "Disable"}
          </button>
          <button
            onClick={() => {
              handleButtonClick("reset");
            }}
            className="blue-button"
          >
            Reset
          </button>
        </>
      ) : (
        <button
          disabled={buttonDisabled}
          onClick={handleButtonClick}
          className={`${!isAuthorized && "green-button"}`}
          style={
            !admin && buttonDisabled && timerStarted
              ? { fontSize: "20vmin" }
              : {}
          }
        >
          {!isAuthorized ? "Join" : buttonDisabled ? timerCounter : "Ready"}
        </button>
      )}
    </section>
  );
};

export default App;
