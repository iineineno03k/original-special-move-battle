import { useEffect, useState } from "react";
import liff from "@line/liff";
import "./App.css";
import { SpecialMoveDto } from "./types";
import { TailSpin } from "react-loader-spinner";
import SpecialMoveCard from "./component/SpecialMoveCard";
import SpecialMoveCardReversed from "./component/SpecialMoveCardReversed";
import { motion } from "framer-motion";
import { Typography } from "@mui/material";


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
      }, 350);
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
      }, 350);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh', justifyContent: 'center' }}>
      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1
        }}>
          <TailSpin
            height={80}
            width={80}
            color="#4fa94d"
            ariaLabel="tail-spin-loading"
            radius={1}
            wrapperStyle={{}}
            wrapperClass=""
            visible={loading}
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
          <div style={{ fontSize: '24px', fontWeight: 'bold', backgroundColor: 'white', borderRadius: '50%', padding: '10px 20px', margin: '20px 0', textAlign: 'center' }}>VS</div>
          {currentData[1] ? (
            <motion.div initial="visible" animate={fadeReversedCard ? "hidden" : "visible"} variants={fadeOut}>
              <SpecialMoveCardReversed key={currentData[1].id} myGallary={myGallary} data={currentData[1]} idToken={idToken} onWin={handleWinFromReversedCard} />
            </motion.div>
          ) : (
            <Typography variant="h6">他の必殺技投稿を待とう！</Typography>
          )}
        </>
      )}
    </div>
  );

}

export default App;
