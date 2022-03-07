/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { useEffect, useState } from 'react';

import { ethers } from 'ethers';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Modal from 'react-modal';
import Web3 from 'web3';

import { useToast } from '../components/toast/ToastProvider';
import { useWeb3modal } from '../context/Web3modal';
import ClaimJSON from '../contracts/Claim.json';
import CWolfTokenJSON from '../contracts/CWolfToken.json';
import MarketPlaceNFTJSON from '../contracts/MarketPlace.json';
import MaterialsNFTJSON from '../contracts/MaterialsNFT.json';
import WolfPacksNFTJSON from '../contracts/WolfPacksNFT.json';
import WolfsNFTJSON from '../contracts/WolfsNFT.json';
import CenteredFooter from '../footer/CenteredFooter';
import MainMenu from '../navigation/MainMenu';

function Status() {
  const toast = useToast();
  const [modalIsOpen, setIsOpen] = useState(false);
  const [approveWolves, setApproveWolves] = useState(false);
  const [approveMaterials, setApproveMaterials] = useState(false);
  const [approveWolfPack, setApproveWolfPack] = useState(false);
  const [approveClaim, setApproveClaim] = useState(false);
  const [approveMarket, setApproveMarket] = useState(false);
  const [checkStatus, setCheckStatus] = useState(false);

  const { web3Provider, address, connect }: any = useWeb3modal();

  const { t } = useTranslation(['cave', 'common']);
  async function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
  }

  function closeModal() {
    setIsOpen(false);
  }
  const checkContractsStatus = async () => {
    const signer = web3Provider.getSigner();
    // Your current metamask account;
    const tokenInst = new ethers.Contract(
      CWolfTokenJSON.address,
      CWolfTokenJSON.abi,
      signer
    );

    const [
      allowanceWolves,
      allowanceMaterials,
      allowanceWolfPack,
      allowanceClaim,
      allowanceMarket,
    ] = await Promise.all([
      tokenInst.allowance(address, WolfsNFTJSON.address),
      tokenInst.allowance(address, MaterialsNFTJSON.address),
      tokenInst.allowance(address, WolfPacksNFTJSON.address),
      tokenInst.allowance(address, ClaimJSON.address),
      tokenInst.allowance(address, MarketPlaceNFTJSON.address),
    ]);

    if (Math.floor(allowanceWolves / 1e18) >= 100) {
      setApproveWolves(true);
    }

    if (Math.floor(allowanceMaterials / 1e18) >= 100) {
      setApproveMaterials(true);
    }

    if (Math.floor(allowanceWolfPack / 1e18) >= 100) {
      setApproveWolfPack(true);
    }

    if (Math.floor(allowanceClaim / 1e18) >= 100) {
      setApproveClaim(true);
    }

    if (Math.floor(allowanceMarket / 1e18) >= 100) {
      setApproveMarket(true);
    }
    setCheckStatus(true);
  };

  const approveContract = async (contract: string) => {
    const web3 = new Web3(window.ethereum);
    const tokenInst = new web3.eth.Contract(
      CWolfTokenJSON.abi as [],
      CWolfTokenJSON.address as string
    );
    let contractAddress = WolfsNFTJSON.address;
    if (contract === 'wolf') {
      contractAddress = WolfsNFTJSON.address;
    }
    if (contract === 'material') {
      contractAddress = MaterialsNFTJSON.address;
    }
    if (contract === 'wolfpack') {
      contractAddress = WolfPacksNFTJSON.address;
    }
    if (contract === 'claim') {
      contractAddress = ClaimJSON.address;
    }
    if (contract === 'marketplace') {
      contractAddress = MarketPlaceNFTJSON.address;
    }
    tokenInst.methods
      .approve(contractAddress, ethers.utils.parseEther('100000000'))
      .send({ from: address })
      .once('transactionHash', () => {
        toast?.pushInfo('Approving purchase with CWOLF', 8000);
      })
      .then((_tx: any) => {
        toast?.pushInfo('You have approved the purchase with CWOLF', 8000);
        if (contract === 'wolf') {
          setApproveWolves(true);
        }
        if (contract === 'material') {
          setApproveMaterials(true);
        }
        if (contract === 'wolfpack') {
          setApproveWolfPack(true);
        }
        if (contract === 'claim') {
          setApproveClaim(true);
        }
        if (contract === 'marketplace') {
          setApproveMarket(true);
        }
      })
      .catch((e: any) => {
        if (e.code === 4001) {
          toast?.pushError(
            'You need to approve the spending of CWOLF in your wallet',
            8000
          );
        }
      });
  };
  useEffect(() => {
    // Connect to the network
    if (web3Provider) {
      checkContractsStatus();
    }
  }, [connect, web3Provider]);

  return (
    <div className="Cave">
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0,user-scalable=0"
        />
        <title>Status | CryptoWolf</title>
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
        <main>
          <div>
            <div className="main-feast-section-wrapper">
              <div className="main-content">
                <div
                  className="item-box"
                  Style={
                    'justify-content: unset;align-items: unset; padding: 40px;'
                  }
                >
                  <h1 className="text-2xl">📃 Contract Status</h1>
                  {web3Provider ? (
                    <>
                      <div className="mt-10">
                        You can find all the contracts that CryptoWolf needs to
                        to interact with in order to function properly. If
                        getting any errors, please enable the ones you have not
                        not yet enabled.
                      </div>
                      {checkStatus ? (
                        <div>
                          <div className="mt-10">
                            {approveWolves ? (
                              <div className="flex flex-row justify-start font-bold items-center gap-4 p-4 bg-gray-900">
                                <span className="p-2 bg-gray-800 rounded-md">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-green-500"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                      clipRule="evenodd"
                                    ></path>
                                  </svg>
                                </span>
                                Wolves NFTs is allowed
                              </div>
                            ) : (
                              <div className="flex flex-row justify-start font-bold items-center gap-4 p-4 bg-gray-900">
                                <span className="p-2 bg-gray-800 rounded-md">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-red-500"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                      clipRule="evenodd"
                                    ></path>
                                  </svg>
                                </span>
                                Wolves NFTs is disabled
                                <span>
                                  <button
                                    onClick={() => approveContract('wolf')}
                                    className="button button-primary font-bold mr-2"
                                  >
                                    Allow contract{' '}
                                  </button>
                                </span>
                              </div>
                            )}
                            {approveMaterials ? (
                              <div className="flex flex-row justify-start font-bold items-center gap-4 p-4 bg-gray-900">
                                <span className="p-2 bg-gray-800 rounded-md">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-green-500"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                      clipRule="evenodd"
                                    ></path>
                                  </svg>
                                </span>
                                Materials NFTs is allowed
                              </div>
                            ) : (
                              <div className="flex flex-row justify-start font-bold items-center gap-4 p-4 bg-gray-900">
                                <span className="p-2 bg-gray-800 rounded-md">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-red-500"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                      clipRule="evenodd"
                                    ></path>
                                  </svg>
                                </span>
                                Materials NFTs is disabled
                                <span>
                                  <button
                                    onClick={() => approveContract('material')}
                                    className="button button-primary font-bold mr-2"
                                  >
                                    Allow contract{' '}
                                  </button>
                                </span>
                              </div>
                            )}
                            {approveWolfPack ? (
                              <div className="flex flex-row justify-start font-bold items-center gap-4 p-4 bg-gray-900">
                                <span className="p-2 bg-gray-800 rounded-md">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-green-500"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                      clipRule="evenodd"
                                    ></path>
                                  </svg>
                                </span>
                                Wolf Pack NFTs is allowed
                              </div>
                            ) : (
                              <div className="flex flex-row justify-start font-bold items-center gap-4 p-4 bg-gray-900">
                                <span className="p-2 bg-gray-800 rounded-md">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-red-500"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                      clipRule="evenodd"
                                    ></path>
                                  </svg>
                                </span>
                                Wolf Pack NFTs is disabled
                                <span>
                                  <button
                                    onClick={() => approveContract('wolfpack')}
                                    className="button button-primary font-bold mr-2"
                                  >
                                    Allow contract{' '}
                                  </button>
                                </span>
                              </div>
                            )}
                            {approveMarket ? (
                              <div className="flex flex-row justify-start font-bold items-center gap-4 p-4 bg-gray-900">
                                <span className="p-2 bg-gray-800 rounded-md">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-green-500"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                      clipRule="evenodd"
                                    ></path>
                                  </svg>
                                </span>
                                Marketplace is allowed
                              </div>
                            ) : (
                              <div className="flex flex-row justify-start font-bold items-center gap-4 p-4 bg-gray-900">
                                <span className="p-2 bg-gray-800 rounded-md">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-red-500"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                      clipRule="evenodd"
                                    ></path>
                                  </svg>
                                </span>
                                Marketplace is disabled
                                <span>
                                  <button
                                    onClick={() =>
                                      approveContract('marketplace')
                                    }
                                    className="button button-primary font-bold mr-2"
                                  >
                                    Allow contract{' '}
                                  </button>
                                </span>
                              </div>
                            )}
                            {approveClaim ? (
                              <div className="flex flex-row justify-start font-bold items-center gap-4 p-4 bg-gray-900">
                                <span className="p-2 bg-gray-800 rounded-md">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-green-500"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                      clipRule="evenodd"
                                    ></path>
                                  </svg>
                                </span>
                                Claim is allowed
                              </div>
                            ) : (
                              <div className="flex flex-row justify-start font-bold items-center gap-4 p-4 bg-gray-900">
                                <span className="p-2 bg-gray-800 rounded-md">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-red-500"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                      clipRule="evenodd"
                                    ></path>
                                  </svg>
                                </span>
                                Claim is disabled
                                <span>
                                  <button
                                    onClick={() => approveContract('claim')}
                                    className="button button-primary font-bold mr-2"
                                  >
                                    Allow contract{' '}
                                  </button>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="item-box">
                          Checking the status of contracts...
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="item-box">Connect Your Wallet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
        <Modal
          isOpen={modalIsOpen}
          onAfterOpen={afterOpenModal}
          onRequestClose={closeModal}
          contentLabel="Example Modal"
        >
          <div className="modal-text">
            You need to approve your $CWOLF token on the Main Game Contract.
          </div>
          <div className="modal-button-container">
            <button className="modal-button" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </Modal>
        <CenteredFooter />
      </div>
    </div>
  );
}

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['cave', 'common', 'footer'])),
  },
});

export default Status;
