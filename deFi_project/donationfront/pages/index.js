import abi from '../utils/DeFi.json';

import { ethers } from "ethers";
import Head from 'next/head'
import Image from 'next/image'
import React, { useEffect, useState } from "react";
import styles from '../styles/Home.module.css'

export default function Home() {
  // Contract Address & ABI
  const contractAddress = "0x8C29A13b8E91B683fB49C092E28BeBFbf9ea292e";
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  const onNameChange = (event) => {
    setName(event.target.value);
  }

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  }

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: 'eth_accounts' })
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  // async function connect() {

  //   // Check if MetaMask is installed, if it is, try connecting to an account
  //   if (typeof window.ethereum !== "undefined") {
  //     try {
  //       console.log("connecting");
  //       // Requests that the user provides an Ethereum address to be identified by. The request causes a MetaMask popup to appear.
  //       await ethereum.request({ method: "eth_requestAccounts" });
  //     } catch (error) {
  //       console.log(error);
  //     }
  //     // If connected, change button to "Connected"
  //     document.getElementById("login_button").innerHTML = "Connected";
  //     // If connected, enable "Swap" button
  //     document.getElementById("swap_button").disabled = false;
  //   }
  //   // Ask user to install MetaMask if it's not detected 
  //   else {
  //     document.getElementById("login_button").innerHTML =
  //       "Please install MetaMask";
  //   }
  // }
  // // Call the connect function when the login_button is clicked
  // document.getElementById("login_button").onclick = connect;

  const sendETH = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const deFi = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("sending ETH..")
        const sendTxn = await deFi.sendETH(
          name ? name : "anon",
          message ? message : "Enjoy your ETH!",
          { value: ethers.utils.parseEther("0.001") }
        );

        await sendTxn.wait();

        console.log("mined ", sendTxn.hash);

        console.log("ETH sent!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const deFi = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("fetching memos from the blockchain..");
        const memos = await deFi.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let deFi;
    isWalletConnected();
    // getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name
        }
      ]);
    };

    const { ethereum } = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      deFi = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      deFi.on("NewMemo", onNewMemo);
    }

    return () => {
      if (deFi) {
        deFi.off("NewMemo", onNewMemo);
      }
    }
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>More Donations, Less Hassle!</title>
        <meta name="description" content="Tipping site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>

      </div>

      <main className={styles.main}>
        <h1 className={styles.title}>
          More Donations, Less Hassle!
        </h1>


        {currentAccount ? (
          <div>
            <form>
              <div>
                <label>
                  Name
                </label>
                <br />

                <input
                  id="name"
                  type="text"
                  placeholder="anon"
                  onChange={onNameChange}
                />
              </div>
              <br />
              <div>
                <label>
                  Send Adnan a message
                </label>
                <br />

                <textarea
                  rows={3}
                  placeholder="Drop your message!"
                  id="message"
                  onChange={onMessageChange}
                  required
                >
                </textarea>
              </div>
              <div>
                <button
                  type="button"
                  onClick={sendETH}
                >
                  Send a donation of 0.001ETH
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button onClick={connectWallet}> Connect your wallet </button>
        )}
      </main>

      {currentAccount && (<h1>Memos received</h1>)}

      {currentAccount && (memos.map((memo, idx) => {
        return (
          <div key={idx} style={{ border: "2px solid", "borderRadius": "5px", padding: "5px", margin: "5px" }}>
            <p style={{ "fontWeight": "bold" }}>"{memo.message}"</p>
            <p>From: {memo.name} at {memo.timestamp.toString()}</p>
          </div>
        )
      }))}

      <footer className={styles.footer}>
        <a
          href="https://github.com/0xAdnan"
          target="_blank"
          rel="noopener noreferrer"
        >
          Created by adnan!
        </a>
      </footer>
    </div>
  )
}
