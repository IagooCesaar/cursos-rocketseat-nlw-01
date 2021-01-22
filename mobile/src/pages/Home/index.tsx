import React, { useState, useEffect } from 'react';
import { 
  View, 
  Image, 
  ImageBackground, 
  StyleSheet, 
  Text 
} from 'react-native'
import { Picker } from '@react-native-picker/picker';
import { RectButton } from 'react-native-gesture-handler'
import { Feather as Icon } from '@expo/vector-icons'

import { useNavigation  } from '@react-navigation/native'

import ibge from '../../services/ibgeLocal'

interface IUFs {
  id: number,
  sigla: string,
  nome: string
}  

interface ICity {
  id: number,
  nome: string,
}



const Home: React.FC = () => {
  const [ufs, setUfs] = useState<IUFs[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [selectedUf, setSelectedUf] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')

  useEffect(() => {
    ibge.get('/estados?orderBy=nome').then(response => setUfs(response.data))
  }, [])

  useEffect(() => {
    ibge.get(`/estados/${selectedUf}/municipios?orderBy=nome`)
      .then(response => setCities(response.data))
  }, [selectedUf])

  const navigation = useNavigation();

  function handleNavigateToPoints() {
    navigation.navigate('Points', {
      selectedUf, selectedCity
    });
  }

  return (
    <ImageBackground 
      style={styles.container}
      source={require('../../assets/home-background.png')}
      imageStyle={{width: 274, height: 368}}
    >
      <View style={styles.main}>
        <Image source={require('../../assets/logo.png')} />
        <Text style={styles.title}>
          Seu marketplace de coleta de resíduos
        </Text>
        <Text style={styles.description} > 
          Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.
        </Text>

        <Picker
          onValueChange={(value) => setSelectedUf(value)}
          selectedValue={selectedUf}
        >
          {ufs && ufs.map(uf => (
            <Picker.Item label={`${uf.nome} (${uf.sigla})`} value={uf.sigla} />
          ))}
        </Picker>

        <Picker
          onValueChange={(value) => setSelectedCity(value)}
          selectedValue={selectedCity}
        >
          {cities && cities.map(city => (
            <Picker.Item label={city.nome} value={city.nome} />
          ))}
        </Picker>
      </View>

      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={handleNavigateToPoints}>
          <View style={styles.buttonIcon}>
            <Text> <Icon name="arrow-right" color="#fff" size={24} /> </Text>            
          </View>
          <Text style={styles.buttonText}>
            Entrar
          </Text>
        </RectButton>
      </View>
    </ImageBackground>
  );
}

export default Home;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,    
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  }
});