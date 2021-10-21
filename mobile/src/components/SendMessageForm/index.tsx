import React, { useState } from 'react';
import { TextInput, View, Alert, Keyboard } from 'react-native';

import { COLORS } from '../../theme';
import { Button } from '../Button';
import { api } from '../../services/api';

import { styles } from './styles';

export function SendMessageForm(){
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  async function handleMessageSubmit() {
    const messageFormatted = message.trim();

    if(messageFormatted) {
      setSendingMessage(true);
      await api.post('messages', { message: messageFormatted });

      setMessage('');
      Keyboard.dismiss();
      setSendingMessage(false);
      Alert.alert('Mensagem enviada com sucesso!');

    }else {
      Alert.alert('Escreva uma mensagem para enviar!');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.input}
        keyboardAppearance='dark'
        placeholder='Qual a sua expectativa para o evento?'
        placeholderTextColor={COLORS.GRAY_PRIMARY}
        multiline
        maxLength={140}
        onChangeText={setMessage}
        value={message}
        editable={!sendingMessage}
      />

      <Button 
        title='ENVIAR MENSAGEM'
        backgroundColor={COLORS.PINK}
        color={COLORS.WHITE}
        isLoading={sendingMessage}
        onPress={handleMessageSubmit}
      />
    </View>
  );
}