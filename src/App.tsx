import React, { useEffect, useState } from 'react';
import liff from '@line/liff';
import { SpecialMoveDto } from './types';
import { TailSpin } from 'react-loader-spinner';
import SpecialMoveCard from './component/SpecialMoveCard';
import SpecialMoveCardReversed from './component/SpecialMoveCardReversed';
import { motion } from 'framer-motion';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material';
import Confetti from 'react-confetti';
import "./App.css";

function App() {
  const [data, setData] = useState<SpecialMoveDto[]>([]);
  const [myGallary, setMyGallary] = useState<SpecialMoveDto[]>([]);
  const [idToken, setIdToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentData, setCurrentData] = useState<SpecialMoveDto[]>([]);
  const [fadeCard, setFadeCard] = useState(false);
  const [fadeReversedCard, setFadeReversedCard] = useState(false);
  const [winCount, setWinCount] = useState(0);
  const [reversedWinCount, setReversedWinCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const initializeLiff = async (id: string) => {
      await liff.init({ liffId: id });
      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }
      const token = liff.getIDToken();
      setIdToken(token);
      const apiUrl = 'https://original-specialmove.onrender.com/get-specialmove-battle';
      const formData = new FormData();
      formData.append('idToken', token);
      try {
        const response = await fetch(apiUrl, { method: 'POST', body: formData });
        const data = await response.json();
        setData(data.battleList);
        setMyGallary(data.myGallary);
        setLoading(false);
      } catch (error) {
        console.error('必殺技取得エラー:', error);
        setLoading(false);
      }
    };
    initializeLiff('2001116233-O1nxNMvR');
  }, []);

  useEffect(() => {
    setCurrentData(data);
  }, [data]);

  useEffect(() => {
    if ((!currentData[0] || !currentData[1]) && !loading) {
      setIsModalOpen(true);
    }
  }, [currentData, loading]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    liff.closeWindow();
  };

  const handleWin = async (winnerIndex: number, loserIndex: number) => {
    if (loserIndex === 0) {
      setFadeCard(true);
    } else {
      setFadeReversedCard(true);
    }
    const apiUrl = 'https://original-specialmove.onrender.com/put-specialmove-battle';
    const formData = new FormData();
    formData.append('spId', String(currentData[winnerIndex].id));
    formData.append('yourSpId', String(currentData[loserIndex].id));
    formData.append('idToken', idToken);
    try {
      fetch(apiUrl, { method: 'POST', body: formData });
      if (winnerIndex === 0) {
        setWinCount(winCount + 1);
        setReversedWinCount(0);
      } else {
        setWinCount(0);
        setReversedWinCount(reversedWinCount + 1);
      }
      if ((winnerIndex === 0 && winCount + 1 === 3) || (winnerIndex === 1 && reversedWinCount + 1 === 3)) {

        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          if (winnerIndex === 0) {
            setFadeCard(true);
          } else {
            setFadeReversedCard(true);
          }
          setCurrentData(currentData => {
            let newData = [...currentData];
            newData.splice(0, 2);
            return newData;
          });
          setWinCount(0);
          setReversedWinCount(0);

          setTimeout(() => {
            setFadeCard(false);
            setFadeReversedCard(false);
          }, 150);
        }, 3000);
      } else {
        const newData = [...currentData];
        if (loserIndex === 0) {
          newData.splice(0, 1, newData[2]);
          newData.splice(2, 1);
        } else {
          newData.splice(1, 1);
        }
        setCurrentData(newData);

        setTimeout(() => {
          setFadeCard(false);
          setFadeReversedCard(false);
        }, 150);
      }
    } catch (error) {
      console.error('戦績APIエラー', error);
    }
  };

  const renderConfetti = () => {
    if (showConfetti) {
      return (
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 0}
          height={typeof window !== 'undefined' ? window.innerHeight : 0}
        />
      );
    }
    return null;
  };

  const handleWinFromCard = () => handleWin(0, 1);
  const handleWinFromReversedCard = () => handleWin(1, 0);

  const vsContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  };

  const vsTextStyle = {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#3A3A3C',
    textShadow: '2px 2px 4px #222224',
    margin: '0 20px',
  };

  const barStyle = {
    height: '4px',
    flex: 1,
    background: 'linear-gradient(to right, #000000, #555555, #000000)',
    boxShadow: '0px 0px 10px 3px rgba(255, 0, 0, 0.6)',
  };

  const fadeOut = {
    visible: { opacity: 1, scale: 1 },
    hidden: { opacity: 0, scale: 0.2 }
  };

  return (
    <div className="rootContainer">

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh', justifyContent: 'center' }}>
        {renderConfetti()}
        {loading && (
          <div className="overlay">
            <TailSpin
              height={80}
              width={80}
              color="#4fa94d"
              ariaLabel="tail-spin-loading"
              radius={1}
              visible={true}
            />
          </div>
        )}
        {!loading && (
          <>
            {currentData[0] && (
              <motion.div initial="visible" animate={fadeCard ? "hidden" : "visible"} variants={fadeOut}>
                <SpecialMoveCard key={currentData[0].id} myGallary={myGallary} data={currentData[0]} idToken={idToken} onWin={handleWinFromCard} showConfetti={showConfetti} />
              </motion.div>
            )}
            <div style={vsContainerStyle}>
              <div style={barStyle}></div>
              <div style={vsTextStyle}>VS</div>
              <div style={barStyle}></div>
            </div>
            {currentData[1] && (
              <motion.div initial="visible" animate={fadeReversedCard ? "hidden" : "visible"} variants={fadeOut}>
                <SpecialMoveCardReversed key={currentData[1].id} myGallary={myGallary} data={currentData[1]} idToken={idToken} onWin={handleWinFromReversedCard} showConfetti={showConfetti} />
              </motion.div>
            )}
          </>
        )}
        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{'通知'}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              他に表示できる必殺技がありません。少し待ってからまた来よう！
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="primary" autoFocus>
              閉じる
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default App;
