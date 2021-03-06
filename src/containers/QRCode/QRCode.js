import React, { Component } from 'react';
import { AsyncStorage, Dimensions, Text } from 'react-native';
import produce from 'immer';
import QRCodeScanner from 'react-native-qrcode-scanner';
import CryptoJS from 'crypto-js';
import apiServices from '../../api/services';
import * as Style from './style';
import NavigationOptions from '../../components/NavigationOptions/NavigationOptions';
import { MISSION_STATUS, Consumer } from '../../store';

@Consumer('missionStore')
export default class QRCode extends Component {
  static navigationOptions = ({ navigation }) => NavigationOptions(navigation, 'qrcode.title', 'mode2')

  onSuccess = async (e) => {
    const data = e.data;
    const { task } = this.props.navigation.state.params;
    const des_key = process.env.MOPCON_DES_KEY;

    const bytes = CryptoJS.DES.decrypt(data, des_key);
    const id = bytes.toString(CryptoJS.enc.Utf8);

    if (id) {
      // 判斷掃到的id跟題目id是否相同
      if (id !== task.id) return;

      const {
        missionStore: { balance, setBalance, quizs, setQuizStatus },
      } = this.props.context;

      // 累計Mo數
      setBalance(balance + +(task.reward));

      // 修改Quiz status
      setQuizStatus(task.id, MISSION_STATUS.SUCCESS);

      this.props.navigation.navigate('MissionDetail', { id: task.id, type: 'task' });
    }
  }

  render() {
    const cameraHeight = Dimensions.get('window').height - 80;

    return (
      <Style.QRCodeContainer>
        <QRCodeScanner
          cameraStyle={{height: cameraHeight}}
          onRead={this.onSuccess}
          topContent={null}
        />
      </Style.QRCodeContainer>
    );
  }
}