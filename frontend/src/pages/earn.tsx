/* eslint-disable no-await-in-loop */
import { useEffect, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";

import CenteredFooter from "../footer/CenteredFooter";
import MainMenu from "../navigation/MainMenu";
import { useWeb3modal } from "../context/Web3modal";
import { useTranslation } from "next-i18next";
import { useToast } from "../components/toast/ToastProvider";
import Web3 from "web3";
import { ethers } from "ethers";
import PoolJSON from "../contracts/Pool.json";
import { MultiCall } from "eth-multicall";
import AppConfig from "../utils/AppConfig";
import CWolfTokenJSON from "../contracts/CWolfToken.json";
import Modal from "react-modal";
import VariablesJSON from "../contracts/Variables.json";

function Earn() {
  const toast = useToast();
  const { t } = useTranslation("common");
  const { web3Provider, address, connect }: any = useWeb3modal();

  const [type, setType] = useState("farm");
  const [pools, setPools] = useState([] as any);
  const [poolView, setPoolView] = useState(null as any);
  const [modalFarmDepositIsOpen, setModalFarmDepositIsOpen] = useState(false);
  const [farmDepositAmount, setFarmDepositAmount] = useState(0);
  const [modalFarmWithdrawIsOpen, setModalFarmWithdrawIsOpen] = useState(false);
  const [farmWithdrawAmount, setFarmWithdrawAmount] = useState(0);
  const [modalFarmClaimIsOpen, setModalFarmClaimIsOpen] = useState(false);

  function closeModalFarmDeposit() {
    setModalFarmDepositIsOpen(false);
  }
  function closeModalFarmWithdraw() {
    setModalFarmWithdrawIsOpen(false);
  }
  function closeModalFarmClaim() {
    setModalFarmClaimIsOpen(false);
  }

  const farmClaim = async () => {
    const web3 = new Web3(window.ethereum);
    const signer = web3Provider.getSigner();

    const poolContract = new ethers.Contract(
      PoolJSON.address as string,
      PoolJSON.abi as [],
      signer
    );

    closeModalFarmClaim();
    const tx = await poolContract
      .claim(Number(poolView).toString())
      .then((then: any) => {})
      .catch((error: any) => {
        toast?.pushError(error.data.message.split(": ")[1]);
      });
  };

  const farmWithdraw = async () => {
    const signer = web3Provider.getSigner();

    const poolContract = new ethers.Contract(
      PoolJSON.address as string,
      PoolJSON.abi as [],
      signer
    );

    const amount = Number(farmWithdrawAmount * 1e18).toString();

    closeModalFarmWithdraw();
    const tx = await poolContract
      .withdraw(Number(poolView).toString(), amount)
      .then((then: any) => {})
      .catch((error: any) => {
        toast?.pushError(error.data.message.split(": ")[1]);
      });
  };

  const farmDeposit = async () => {
    const signer = web3Provider.getSigner();

    const poolContract = new ethers.Contract(
      PoolJSON.address as string,
      PoolJSON.abi as [],
      signer
    );

    const amount = farmDepositAmount.toString() + "000000000000000000";

    closeModalFarmDeposit();
    const tx = await poolContract
      .deposit(Number(poolView).toString(), amount)
      .then((then: any) => {})
      .catch((error: any) => {
        toast?.pushError(error.data.message.split(": ")[1]);
      });
  };

  const getPools = async () => {
    const web3 = new Web3(window.ethereum);
    const multicall = new MultiCall(web3, AppConfig.MULTICALL);

    const variablesContract = new web3.eth.Contract(
      VariablesJSON.abi as [],
      VariablesJSON.address as string
    );
    const poolContract = new web3.eth.Contract(
      PoolJSON.abi as [],
      PoolJSON.address as string
    );

    const poolsID = await poolContract.methods.poolLength().call();

    const poolsCalls = [];
    for (let i = 0; i < poolsID; i++) {
      poolsCalls.push({ info: await poolContract.methods.poolInfo(i) });
    }
    const poolsResults = await multicall.all([poolsCalls]);

    if (poolsResults[0]) {
      let i = 0;
      for await (const poolResult of poolsResults[0]) {
        const pending = await poolContract.methods
          .pendingCWolf(i, address)
          .call();

        poolResult.info[8] = pending;

        const totalStakedUSD = await variablesContract.methods
          .getDollarsInCWOLF(poolResult.info[7])
          .call();

        poolResult.info[9] = totalStakedUSD;

        const userInfo = await poolContract.methods.userInfo(i, address).call();

        poolResult.info[10] = userInfo;

        if (i < 2) {
          const dailyReward = await variablesContract.methods
            .getDollarsInCWOLF(3000)
            .call();

          const APR =
            (Number(dailyReward * 365) / Number(pending / 1e18)) * 100;

          poolResult.info[11] = APR;
        } else {
          poolResult.info[11] = 0;
        }

        i++;
      }

      setPools(poolsResults[0]);
    }
  };

  const approveToken = async (tokenInst: any) => {
    tokenInst.methods
      .approve(PoolJSON.address, ethers.utils.parseEther("100000000"))
      .send({ from: address })
      .then((_tx: any) => {
        toast?.pushInfo("You have approved the contract correctly.", 8000);
      })
      .catch((e: any) => {
        if (e.code === 4001) {
          toast?.pushError(
            "You need to approve the spending of CWOLF in your wallet",
            8000
          );
        }
      });
  };

  const approveCWOLF = async () => {
    const web3 = new Web3(window.ethereum);

    const tokenInst = new web3.eth.Contract(
      CWolfTokenJSON.abi as [],
      CWolfTokenJSON.address as string
    );

    const allowanceBalance = await tokenInst.methods
      .allowance(address, PoolJSON.address)
      .call();

    if (Math.floor(allowanceBalance / 1e18) < 100) {
      approveToken(tokenInst);
    }
  };

  const approveTokenBUSDCWOLF = async (tokenInst: any) => {
    tokenInst.methods
      .approve(
        "0x7c4e6Ea6Ad59Dda8EDDbf65bE83c23D4CDFf3A29",
        ethers.utils.parseEther("100000000")
      )
      .send({ from: address })
      .then((_tx: any) => {
        toast?.pushInfo("You have approved the contract correctly.", 8000);
      })
      .catch((e: any) => {
        if (e.code === 4001) {
          toast?.pushError(
            "You need to approve the spending of CWOLF in your wallet",
            8000
          );
        }
      });
  };

  const approveBUSDCWOLF = async () => {
    const web3 = new Web3(window.ethereum);

    const tokenInst = new web3.eth.Contract(
      CWolfTokenJSON.abi as [],
      CWolfTokenJSON.address as string
    );

    const allowanceBalance = await tokenInst.methods
      .allowance(address, "0x7c4e6Ea6Ad59Dda8EDDbf65bE83c23D4CDFf3A29")
      .call();

    if (Math.floor(allowanceBalance / 1e18) < 100) {
      approveTokenBUSDCWOLF(tokenInst);
    }
  };

  useEffect(() => {
    if (web3Provider) {
      approveCWOLF();
      approveBUSDCWOLF();
      getPools();
    }
  }, [web3Provider]);

  return (
    <div className="Home">
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0,user-scalable=0"
        />
        <title>Earn | CryptoWolf</title>
        <meta name="description" content="CryptoWolf" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div className="feast-wrapper">
        <img
          className="bg-web"
          src="https://cdn.cryptowolf.finance/images/background-wolf.jpg"
          alt="BACKGROUND"
        ></img>
        <header className="header">
          <MainMenu />
        </header>
        <main className="w-full h-full flex flex-col p-4 md:p-8 lg:p-16 lg:pt-8">
          <div className="w-full flex justify-center items-center gap-4">
            <button
              className={`button ${
                type == "farm" ? "button-primary" : "button-regular"
              }`}
              onClick={() => setType("farm")}
            >
              Farms
            </button>
            <button
              className={`button ${
                type == "pool" ? "button-primary" : "button-regular"
              }`}
              onClick={() => setType("pool")}
            >
              Pools
            </button>
          </div>
          <div className="w-full mt-8 md:mt-12 flex flex-col justify-center items-center gap-4 md:gap-8">
            {type == "farm" ? (
              <>
                {pools.map((pool: any, index: number) => {
                  if (index < 2) {
                    return null;
                  }

                  return (
                    <>
                      <div className="w-full md:w-9/12 lg:w-3/5 xl:w-1/2 flex flex-col">
                        <div
                          className="relative w-full flex items-center rounded-lg shadow-lg px-6 py-4 cursor-pointer"
                          style={{ background: "#061231" }}
                          onClick={() => {
                            poolView == index
                              ? setPoolView(null)
                              : setPoolView(index);
                          }}
                        >
                          {pool.info[5] > 0 ? (
                            <>
                              <div className="absolute -top-2 right-0 text-xs uppercase text-red-500">
                                Blocked {Number(pool.info[5] / 60).toFixed(0)}{" "}
                                minutes
                              </div>
                            </>
                          ) : null}
                          <div className="flex justify-center items-center">
                            <div className="flex justify-center items-center mr-4">
                              <div className="w-6 h-6">
                                <svg
                                  className="w-full h-full"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 96 96"
                                >
                                  <circle
                                    cx="48"
                                    cy="48"
                                    r="48"
                                    fill="#F0B90B"
                                  />
                                  <path
                                    fill="#FFFDFA"
                                    d="M30.0991 48L22.7551 55.395L15.3601 48L22.7551 40.605L30.0991 48ZM48.0001 30.099L60.6481 42.747L68.0431 35.352L55.3951 22.755L48.0001 15.36L40.6051 22.755L28.0081 35.352L35.4031 42.747L48.0001 30.099ZM73.2451 40.605L65.9011 48L73.2961 55.395L80.6401 48L73.2451 40.605ZM48.0001 65.901L35.3521 53.253L28.0081 60.648L40.6561 73.296L48.0001 80.64L55.3951 73.245L68.0431 60.597L60.6481 53.253L48.0001 65.901ZM48.0001 55.395L55.3951 48L48.0001 40.605L40.6051 48L48.0001 55.395Z"
                                  />
                                </svg>
                              </div>
                              <div className="w-8 h-8">
                                <img
                                  className="w-full h-full"
                                  src="/images/cwolf-ico.png"
                                  alt="CWOLF"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col font-bold text-normal mr-8 md:mr-16">
                              BUSD-CWOLF
                              <small>LPToken Pancakeswap</small>
                            </div>
                          </div>
                          <div className="flex-1 flex justify-around items-center">
                            <div className="flex flex-col">
                              <div className="font-semibold text-sm">
                                Deposited
                              </div>
                              <div className="font-bold text-sm">
                                {Number(pool.info[10].amount / 1e18).toFixed(2)}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="font-semibold text-sm">
                                Earned
                              </div>
                              <div className="font-bold text-sm">
                                {Number(pool.info[8] / 1e18).toFixed(2)}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="font-semibold text-sm">APR</div>
                              <div className="font-bold text-sm">
                                {pool.info[11]}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="font-semibold text-sm">
                                Liquidity
                              </div>
                              <div className="font-bold text-sm">
                                $ {Number(pool.info[9] / 1e18).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-full relative -top-2 rounded-lg px-6 py-4 justify-center items-center gap-4 ${
                            poolView == index ? "flex" : "hidden"
                          }`}
                          style={{ background: "#061231" }}
                        >
                          <div className="flex flex-col justify-center items-center">
                            <a
                              className="flex text-sm font-bold text-blue-500 hover:underline"
                              href="https://pancakeswap.finance/add/0x8c5921a9563E6d5dDa95cB46b572Bb1Cc9b04a27/0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"
                              target="_blank"
                            >
                              Get CWOLF-BUSD LP
                              <svg
                                viewBox="0 0 24 24"
                                color="rgba(59, 130, 246, var(--tw-text-opacity))"
                                fill="rgba(59, 130, 246, var(--tw-text-opacity))"
                                width="20px"
                                xmlns="http://www.w3.org/2000/svg"
                                className="ml-2"
                              >
                                <path d="M18 19H6C5.45 19 5 18.55 5 18V6C5 5.45 5.45 5 6 5H11C11.55 5 12 4.55 12 4C12 3.45 11.55 3 11 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V13C21 12.45 20.55 12 20 12C19.45 12 19 12.45 19 13V18C19 18.55 18.55 19 18 19ZM14 4C14 4.55 14.45 5 15 5H17.59L8.46 14.13C8.07 14.52 8.07 15.15 8.46 15.54C8.85 15.93 9.48 15.93 9.87 15.54L19 6.41V9C19 9.55 19.45 10 20 10C20.55 10 21 9.55 21 9V4C21 3.45 20.55 3 20 3H15C14.45 3 14 3.45 14 4Z"></path>
                              </svg>
                            </a>
                            <a
                              className="flex text-sm font-bold text-blue-500 hover:underline"
                              href="https://bscscan.com/address/0x6FACFDC7EaFb2eC0044E140551630d2BA12c1Def"
                              target="_blank"
                            >
                              View Contract
                              <svg
                                viewBox="0 0 24 24"
                                color="rgba(59, 130, 246, var(--tw-text-opacity))"
                                fill="rgba(59, 130, 246, var(--tw-text-opacity))"
                                width="20px"
                                xmlns="http://www.w3.org/2000/svg"
                                className="ml-2"
                              >
                                <path d="M18 19H6C5.45 19 5 18.55 5 18V6C5 5.45 5.45 5 6 5H11C11.55 5 12 4.55 12 4C12 3.45 11.55 3 11 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V13C21 12.45 20.55 12 20 12C19.45 12 19 12.45 19 13V18C19 18.55 18.55 19 18 19ZM14 4C14 4.55 14.45 5 15 5H17.59L8.46 14.13C8.07 14.52 8.07 15.15 8.46 15.54C8.85 15.93 9.48 15.93 9.87 15.54L19 6.41V9C19 9.55 19.45 10 20 10C20.55 10 21 9.55 21 9V4C21 3.45 20.55 3 20 3H15C14.45 3 14 3.45 14 4Z"></path>
                              </svg>
                            </a>
                          </div>
                          <button
                            className="button button-primary text-uppercase"
                            onClick={() => {
                              setPoolView(index);
                              setModalFarmDepositIsOpen(true);
                            }}
                          >
                            Deposit
                          </button>
                          <Modal
                            isOpen={modalFarmDepositIsOpen}
                            onRequestClose={closeModalFarmDeposit}
                            ariaHideApp={false}
                          >
                            <div className="modal-text">
                              <div className="w-full flex flex-col justify-center items-center">
                                <div className="w-full text-center">
                                  <h1 className="text-2xl text-center">
                                    DEPOSIT <small>BUSD-CWOLF</small>
                                  </h1>
                                </div>
                                <div className="w-full mt-4">
                                  <input
                                    type="number"
                                    min="0"
                                    pattern="[0-9]*"
                                    onChange={(ev: any) => {
                                      setFarmDepositAmount(ev.target.value);
                                    }}
                                    className="w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    value={farmDepositAmount}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="modal-button-container">
                              <button
                                className="modal-cancel"
                                onClick={closeModalFarmDeposit}
                              >
                                cancel
                              </button>
                              <button
                                onClick={() => farmDeposit()}
                                className="button button-primary"
                              >
                                DEPOSIT
                              </button>
                            </div>
                          </Modal>
                          <button
                            className="button button-primary text-uppercase"
                            onClick={() => {
                              setPoolView(index);
                              setFarmWithdrawAmount(
                                Number(
                                  Number(pool.info[10].amount / 1e18).toFixed(2)
                                )
                              );
                              setModalFarmWithdrawIsOpen(true);
                            }}
                            disabled={
                              Number(
                                Number(pool.info[10].amount / 1e18).toFixed(2)
                              ) <= 0
                            }
                          >
                            Withdraw
                          </button>
                          <Modal
                            isOpen={modalFarmWithdrawIsOpen}
                            onRequestClose={closeModalFarmWithdraw}
                            ariaHideApp={false}
                          >
                            <div className="modal-text">
                              <div className="w-full flex flex-col justify-center items-center">
                                <div className="w-full text-center">
                                  <h1 className="text-2xl text-center">
                                    WITHDRAW <small>BUSD-CWOLF</small>
                                  </h1>
                                </div>
                                <div className="w-full mt-4">
                                  <input
                                    type="number"
                                    min="0"
                                    pattern="[0-9]*"
                                    onChange={(ev: any) => {
                                      setFarmWithdrawAmount(ev.target.value);
                                    }}
                                    className="w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    value={farmWithdrawAmount}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="modal-button-container">
                              <button
                                className="modal-cancel"
                                onClick={closeModalFarmWithdraw}
                              >
                                cancel
                              </button>
                              <button
                                onClick={() => farmWithdraw()}
                                className="button button-primary"
                              >
                                WITHDRAW
                              </button>
                            </div>
                          </Modal>
                          <button
                            className="button button-primary text-uppercase"
                            onClick={() => {
                              setPoolView(index);
                              setModalFarmClaimIsOpen(true);
                            }}
                            disabled={
                              Number(Number(pool.info[9] / 1e18).toFixed(2)) <=
                              0
                            }
                          >
                            Harvest
                          </button>
                          <Modal
                            isOpen={modalFarmClaimIsOpen}
                            onRequestClose={closeModalFarmClaim}
                            ariaHideApp={false}
                          >
                            <div className="modal-text">
                              <div className="w-full flex flex-col justify-center items-center">
                                <div className="w-full text-center">
                                  <h1 className="text-2xl text-center">
                                    Harvest <small>BUSD-CWOLF</small>
                                  </h1>
                                </div>
                                <div className="w-full mt-4 text-center">
                                  Do you really want to make the harvest?
                                </div>
                              </div>
                            </div>
                            <div className="modal-button-container">
                              <button
                                className="modal-cancel"
                                onClick={closeModalFarmClaim}
                              >
                                cancel
                              </button>
                              <button
                                onClick={() => farmClaim()}
                                className="button button-primary"
                              >
                                HARVEST
                              </button>
                            </div>
                          </Modal>
                        </div>
                      </div>
                    </>
                  );
                })}
              </>
            ) : (
              <>
                {pools.map((pool: any, index: number) => {
                  if (index > 1) {
                    return null;
                  }

                  return (
                    <>
                      <div className="w-full md:w-9/12 lg:w-3/5 xl:w-1/2 flex flex-col">
                        <div
                          className="relative w-full flex items-center rounded-lg shadow-lg px-6 py-4 cursor-pointer"
                          style={{ background: "#061231" }}
                          onClick={() => {
                            poolView == index
                              ? setPoolView(null)
                              : setPoolView(index);
                          }}
                        >
                          {pool.info[5] > 0 ? (
                            <>
                              <div className="absolute -top-2 right-0 text-xs uppercase text-red-500">
                                Blocked {Number(pool.info[5] / 60).toFixed(0)}{" "}
                                minutes
                              </div>
                            </>
                          ) : null}
                          <div className="flex justify-center items-center">
                            <div className="flex justify-center items-center mr-4">
                              <div className="w-8 h-8">
                                <img
                                  className="w-full h-full"
                                  src="/images/cwolf-ico.png"
                                  alt="CWOLF"
                                />
                              </div>
                            </div>
                            <div className="font-bold text-normal mr-8 md:mr-16">
                              CWOLF
                            </div>
                          </div>
                          <div className="flex-1 flex justify-around items-center">
                            <div className="flex flex-col">
                              <div className="font-semibold text-sm">
                                Deposited
                              </div>
                              <div className="font-bold text-sm">
                                {Number(pool.info[10].amount / 1e18).toFixed(2)}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="font-semibold text-sm">
                                Earned
                              </div>
                              <div className="font-bold text-sm">
                                {Number(pool.info[8] / 1e18).toFixed(2)}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="font-semibold text-sm">APR</div>
                              <div className="font-bold text-sm">
                                {pool.info[11].toFixed(2)}%
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="font-semibold text-sm">
                                Liquidity
                              </div>
                              <div className="font-bold text-sm">
                                $ {Number(pool.info[9] / 1e18).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-full relative -top-2 rounded-lg px-6 py-4 justify-center items-center gap-4 ${
                            poolView == index ? "flex" : "hidden"
                          }`}
                          style={{ background: "#061231" }}
                        >
                          <button
                            className="button button-primary text-uppercase"
                            onClick={() => {
                              setPoolView(index);
                              setModalFarmDepositIsOpen(true);
                            }}
                          >
                            Deposit
                          </button>
                          <Modal
                            isOpen={modalFarmDepositIsOpen}
                            onRequestClose={closeModalFarmDeposit}
                            ariaHideApp={false}
                          >
                            <div className="modal-text">
                              <div className="w-full flex flex-col justify-center items-center">
                                <div className="w-full text-center">
                                  <h1 className="text-2xl text-center">
                                    DEPOSIT <small>CWOLF</small>
                                  </h1>
                                </div>
                                <div className="w-full mt-4">
                                  <input
                                    type="number"
                                    min="0"
                                    pattern="[0-9]*"
                                    onChange={(ev: any) => {
                                      setFarmDepositAmount(ev.target.value);
                                    }}
                                    className="w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    value={farmDepositAmount}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="modal-button-container">
                              <button
                                className="modal-cancel"
                                onClick={closeModalFarmDeposit}
                              >
                                cancel
                              </button>
                              <button
                                onClick={() => farmDeposit()}
                                className="button button-primary"
                              >
                                DEPOSIT
                              </button>
                            </div>
                          </Modal>
                          <button
                            className="button button-primary text-uppercase"
                            onClick={() => {
                              setPoolView(index);
                              setFarmWithdrawAmount(
                                Number(
                                  Number(pool.info[10].amount / 1e18).toFixed(2)
                                )
                              );
                              setModalFarmWithdrawIsOpen(true);
                            }}
                            disabled={
                              Number(
                                Number(pool.info[10].amount / 1e18).toFixed(2)
                              ) <= 0
                            }
                          >
                            Withdraw
                          </button>
                          <Modal
                            isOpen={modalFarmWithdrawIsOpen}
                            onRequestClose={closeModalFarmWithdraw}
                            ariaHideApp={false}
                          >
                            <div className="modal-text">
                              <div className="w-full flex flex-col justify-center items-center">
                                <div className="w-full text-center">
                                  <h1 className="text-2xl text-center">
                                    WITHDRAW <small>CWOLF</small>
                                  </h1>
                                </div>
                                <div className="w-full mt-4">
                                  <input
                                    type="number"
                                    min="0"
                                    pattern="[0-9]*"
                                    onChange={(ev: any) => {
                                      setFarmWithdrawAmount(ev.target.value);
                                    }}
                                    className="w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    value={farmWithdrawAmount}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="modal-button-container">
                              <button
                                className="modal-cancel"
                                onClick={closeModalFarmWithdraw}
                              >
                                cancel
                              </button>
                              <button
                                onClick={() => farmWithdraw()}
                                className="button button-primary"
                              >
                                WITHDRAW
                              </button>
                            </div>
                          </Modal>
                          <button
                            className="button button-primary text-uppercase"
                            onClick={() => {
                              setPoolView(index);
                              setModalFarmClaimIsOpen(true);
                            }}
                            disabled={
                              Number(Number(pool.info[9] / 1e18).toFixed(2)) <=
                              0
                            }
                          >
                            Harvest
                          </button>
                          <Modal
                            isOpen={modalFarmClaimIsOpen}
                            onRequestClose={closeModalFarmClaim}
                            ariaHideApp={false}
                          >
                            <div className="modal-text">
                              <div className="w-full flex flex-col justify-center items-center">
                                <div className="w-full text-center">
                                  <h1 className="text-2xl text-center">
                                    HARVEST <small>CWOLF</small>
                                  </h1>
                                </div>
                                <div className="w-full mt-4 text-center">
                                  Do you really want to make the harvest?
                                </div>
                              </div>
                            </div>
                            <div className="modal-button-container">
                              <button
                                className="modal-cancel"
                                onClick={closeModalFarmClaim}
                              >
                                cancel
                              </button>
                              <button
                                onClick={() => farmClaim()}
                                className="button button-primary"
                              >
                                HARVEST
                              </button>
                            </div>
                          </Modal>
                        </div>
                      </div>
                    </>
                  );
                })}
              </>
            )}
          </div>
        </main>
        <CenteredFooter />
      </div>
    </div>
  );
}

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default Earn;
