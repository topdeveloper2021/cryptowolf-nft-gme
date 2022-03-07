/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { useEffect, useState } from 'react';

import { ethers } from 'ethers';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Modal from 'react-modal';

import CountDownTimer from '../components/elements/CountDownTimer';
import { useToast } from '../components/toast/ToastProvider';
import { useWeb3modal } from '../context/Web3modal';
import ClaimJSON from '../contracts/Claim.json';
import CenteredFooter from '../footer/CenteredFooter';
import MainMenu from '../navigation/MainMenu';

function Bonus() {
  const toast = useToast();
  const [modalIsOpen, setIsOpen] = useState(false);
  const [showBonus, setShowBonus] = useState(false);
  const [taxAmount, setTaxAmount] = useState(100);
  const [timeTaxZero, setTimeTaxZero] = useState(0);

  const chestArray = [
    [
      86400 * 3,
      { hours: 24 * 3, minutes: 0, seconds: 0 },
      'https://cdn.cryptowolf.finance/images/chest/blockironchest.png',
    ],
    [
      86400 * 6,
      { hours: 24 * 6, minutes: 0, seconds: 0 },
      'https://cdn.cryptowolf.finance/images/chest/blockironchest.png',
    ],
    [
      86400 * 9,
      { hours: 24 * 9, minutes: 0, seconds: 0 },
      'https://cdn.cryptowolf.finance/images/chest/blockironchest.png',
    ],
    [
      86400 * 12,
      { hours: 24 * 12, minutes: 0, seconds: 0 },
      'https://cdn.cryptowolf.finance/images/chest/blockironchest.png',
    ],
    [
      86400 * 15,
      { hours: 24 * 15, minutes: 0, seconds: 0 },
      'https://cdn.cryptowolf.finance/images/chest/blockironchest.png',
    ],
    [
      86400 * 18,
      { hours: 24 * 18, minutes: 0, seconds: 0 },
      'https://cdn.cryptowolf.finance/images/chest/blockgoldchest.png',
    ],
    [
      86400 * 21,
      { hours: 24 * 21, minutes: 0, seconds: 0 },
      'https://cdn.cryptowolf.finance/images/chest/blockgoldchest.png',
    ],
    [
      86400 * 24,
      { hours: 24 * 24, minutes: 0, seconds: 0 },
      'https://cdn.cryptowolf.finance/images/chest/blockgoldchest.png',
    ],
    [
      86400 * 27,
      { hours: 24 * 27, minutes: 0, seconds: 0 },
      'https://cdn.cryptowolf.finance/images/chest/blockgoldchest.png',
    ],
    [
      86400 * 30,
      { hours: 24 * 30, minutes: 0, seconds: 0 },
      'https://cdn.cryptowolf.finance/images/chest/blockgoldchest.png',
    ],
    [
      86400 * 33,
      { hours: 24 * 33, minutes: 0, seconds: 0 },
      'https://cdn.cryptowolf.finance/images/chest/blockdiamondchest.png',
    ],
    [
      86400 * 36,
      { hours: 24 * 36, minutes: 0, seconds: 0 },
      'https://cdn.cryptowolf.finance/images/chest/blockdiamondchest.png',
    ],
    [
      86400 * 39,
      { hours: 24 * 39, minutes: 0, seconds: 0 },
      'https://cdn.cryptowolf.finance/images/chest/blockdiamondchest.png',
    ],
    [
      86400 * 42,
      { hours: 24 * 42, minutes: 0, seconds: 0 },
      'https://cdn.cryptowolf.finance/images/chest/blockdiamondchest.png',
    ],
    [
      86400 * 45,
      { hours: 24 * 45, minutes: 0, seconds: 0 },
      'https://cdn.cryptowolf.finance/images/chest/blockdiamondchest.png',
    ],
  ];

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

  const getTimeClaim = async () => {
    const signer = web3Provider.getSigner();

    const ClaimInst = new ethers.Contract(
      ClaimJSON.address,
      ClaimJSON.abi,
      signer
    );

    const usersTaxAmount = await ClaimInst.usersTaxAmount(address);
    setTaxAmount(parseInt(`${usersTaxAmount / 100}`, 10));
    setShowBonus(true);
  };

  useEffect(() => {
    // Connect to the network
    if (web3Provider) {
      getTimeClaim();
    }
  }, [connect, web3Provider]);

  return (
    <div className="Cave">
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0,user-scalable=0"
        />
        <title>Holder bonus | CryptoWolf</title>
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
                <div className="item-box" Style={'min-height: 40px;'}>
                  <h1 className="text-2xl">📦 Holder Bonus</h1>
                </div>
                {showBonus && (
                  <div className="flex flex-col md:grid grid-cols-9 mx-auto p-2 text-blue-50">
                    {chestArray.map((item: any) => (
                      <div
                        key={item[0]}
                        className="flex flex-row-reverse md:contents"
                      >
                        <div className="bg-pink-700 border-4 border-amber-300 col-start-1 col-end-5 p-4 rounded-xl my-4 ml-auto shadow-md">
                          <p className="leading-tight text-center justify-center w-32">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-20 w-20 text-brown-500 mx-auto"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                            <br />
                            {taxAmount === 0 ? (
                              <CountDownTimer hoursMinSecs={item[1]} />
                            ) : (
                              <div>You need to reach Tax 0%</div>
                            )}
                          </p>
                        </div>
                        <div className="col-start-5 col-end-6 md:mx-auto relative mr-10">
                          <div className="h-full w-6 flex items-center justify-center">
                            <div className="h-full w-1 bg-yellow-400 pointer-events-none"></div>
                          </div>
                          <div className="w-6 h-6 absolute top-1/2 -mt-3 rounded-full bg-yellow-300 shadow"></div>
                        </div>
                        <div className="bg-pink-700 border-4 col-start-6 col-end-10 p-4 rounded-xl my-4 mr-auto shadow-md flex items-center">
                          <p className="leading-tight text-justify">
                            <img
                              src={item[2]}
                              className="h-28 w-28"
                              alt="iron chest"
                            />
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

export default Bonus;
