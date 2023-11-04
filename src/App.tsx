import { useEffect, useState } from "react";
import liff from "@line/liff";
import "./App.css";
import { SpecialMoveDto } from "./types";
import { TailSpin } from "react-loader-spinner";
import SpecialMoveCard from "./component/SpecialMoveCard";
import SpecialMoveCardReversed from "./component/SpecialMoveCardReversed";
import { motion } from "framer-motion";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from "@mui/material";


function App() {
  const [data, setData] = useState<SpecialMoveDto[]>([]);
  const [myGallary, setMyGallary] = useState<SpecialMoveDto[]>([]);
  const [idToken, setIdToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentData, setCurrentData] = useState(data);
  const [fadeCard, setFadeCard] = useState(false);
  const [fadeReversedCard, setFadeReversedCard] = useState(false);
  const [winCount, setWinCount] = useState(0);
  const [reversedWinCount, setReversedWinCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCloseModal = () => {
    liff.closeWindow();
  };

  const handleWinFromCard = async () => {
    setFadeReversedCard(true);

    if (currentData[1]) { // SpecialMoveCardReversedが存在するかを確認
      setWinCount(winCount + 1);
      setReversedWinCount(0);
      const apiUrl = 'https://original-specialmove.onrender.com/put-specialmove-battle';
      const formData = new FormData();
      formData.append('spId', String(currentData[0].id));
      formData.append('yourSpId', String(currentData[1].id));
      formData.append('winCount', String(reversedWinCount));
      formData.append('idToken', idToken);
      try {
        await fetch(apiUrl, { method: 'POST', body: formData });
      } catch (error) {
        console.error('戦績APIエラー', error);
      }

      setTimeout(() => {
        const newData = [...currentData];
        newData.splice(1, 1);
        setCurrentData(newData);
        setFadeReversedCard(false);
      }, 150);
    }
  };

  const handleWinFromReversedCard = async () => {
    setFadeCard(true);

    if (currentData[0]) {
      setWinCount(0);
      setReversedWinCount(reversedWinCount + 1);
      const apiUrl = 'https://original-specialmove.onrender.com/put-specialmove-battle';
      const formData = new FormData();
      formData.append('spId', String(currentData[1].id));
      formData.append('yourSpId', String(currentData[0].id));
      formData.append('winCount', String(reversedWinCount));
      formData.append('idToken', idToken);
      try {
        await fetch(apiUrl, { method: 'POST', body: formData });
      } catch (error) {
        console.error('戦績APIエラー', error);
      }
      setTimeout(() => {
        const newData = [...currentData];
        newData.splice(0, 1, newData[2]);
        newData.splice(2, 1);
        setCurrentData(newData);
        setFadeCard(false);
      }, 150);
    }
  };

  const fadeOut = {
    visible: { opacity: 1, scale: 1 },
    hidden: { opacity: 0, scale: 0.2 }
  };


  useEffect(() => {
    // liff関連のlocalStorageのキーのリストを取得
    const getLiffLocalStorageKeys = (prefix: string) => {
      const keys = []
      for (var i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key.indexOf(prefix) === 0) {
          keys.push(key)
        }
      }
      return keys
    }
    // 期限切れのIDTokenをクリアする
    const clearExpiredIdToken = (liffId: any) => {
      const keyPrefix = `LIFF_STORE:${liffId}:`
      const key = keyPrefix + 'decodedIDToken'
      const decodedIDTokenString = localStorage.getItem(key)
      if (!decodedIDTokenString) {
        return
      }
      const decodedIDToken = JSON.parse(decodedIDTokenString)
      // 有効期限をチェック
      if (new Date().getTime() > decodedIDToken.exp * 1000) {
        const keys = getLiffLocalStorageKeys(keyPrefix)
        keys.forEach(function (key) {
          localStorage.removeItem(key)
        })
      }
    }
    const initializeLiff = async (id: string) => {
      clearExpiredIdToken(id);
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
      } catch (error) {
        console.error('必殺技取得エラー:', error);
      } finally {
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

  const vsContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center', // 中央に寄せる
    width: '100%', // コンテナを親の幅いっぱいに広げる
  };

  const vsTextStyle: React.CSSProperties = {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#3A3A3C',
    textShadow: '2px 2px 4px #222224',
    margin: '0 20px', // テキストの左右のマージン
  };

  const barStyle: React.CSSProperties = {
    height: '4px',
    flex: 1, // バーを可能な限りの幅に拡張
    background: 'linear-gradient(to right, #000000, #555555, #000000)',
    boxShadow: '0px 0px 10px 3px rgba(255, 0, 0, 0.6)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh', justifyContent: 'center' }}>
      {loading ? (
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
      ) : (
        <>
          {currentData[0] ? (
            <motion.div initial="visible" animate={fadeCard ? "hidden" : "visible"} variants={fadeOut}>
              <SpecialMoveCard key={currentData[0].id} myGallary={myGallary} data={currentData[0]} idToken={idToken} onWin={handleWinFromCard} />
            </motion.div>
          ) : (
            <Typography variant="h6">他の必殺技投稿を待とう！</Typography>
          )}
          <div style={vsContainerStyle}>
            <div style={barStyle}></div>
            <div style={vsTextStyle}>VS</div>
            <div style={barStyle}></div>
          </div>
          {currentData[1] ? (
            <motion.div initial="visible" animate={fadeReversedCard ? "hidden" : "visible"} variants={fadeOut}>
              <SpecialMoveCardReversed key={currentData[1].id} myGallary={myGallary} data={currentData[1]} idToken={idToken} onWin={handleWinFromReversedCard} />
            </motion.div>
          ) : (
            <Typography variant="h6">他の必殺技投稿を待とう！</Typography>
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
  );

}

export default App;
