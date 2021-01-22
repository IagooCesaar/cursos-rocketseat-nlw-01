import React, { useState, useEffect, ChangeEvent, FormEvent} from 'react';
import {Link, useHistory} from 'react-router-dom'
import {FiArrowLeft} from 'react-icons/fi'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, MarkerProps } from 'react-leaflet'
import {LeafletMouseEvent} from 'leaflet'

import Dropzone from '../../components/Dropzone'

import './CreatePoint.css'
import logo from '../../assets/logo.svg';

import api from '../../services/api'
import ibge from '../../services/ibgeLocal'

interface IItems {
  id: number,
  title: string,
  image_url: string
}

interface IUFs {
  id: number,
  sigla: string,
  nome: string
}  

interface ICity {
  id: number,
  nome: string,
}

const CreatePoint: React.FC = () => {
  const [items, setItems] = useState<IItems[]>([]);
  const [ufs, setUfs] = useState<IUFs[]>([]);
  const [selectedUf, setSelectedUf] = useState('');
  const [cities, setCities] = useState<ICity[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPosition, setSelectedPosition] = useState([0,0]);
  const [initialPosition, setInitialPosition] = useState([0,0]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<File>() ;  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''  
  })

  const history = useHistory();

  // obter dados iniciais, como items, estados (UFs)
  useEffect(() => {
    async function getItems() {
      try {
        const response = await api.get('/items');
        setItems(response.data)        
      } catch(error) {
  
      }
    }
    async function getUfs() {
      try {
        const response = await ibge.get('/estados?orderBy=nome');
        setUfs(response.data)
      } catch (error) {
        
      }
    }
    getItems();
    getUfs();
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      //[-21.8920929,-45.5913015]
      console.log(position)
      setInitialPosition([
        position.coords.latitude,
        position.coords.longitude
      ]);
    })
  }, [])

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value;
    setSelectedUf(uf)
  }
  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;
    setSelectedCity(city)
  }
  // Obter do IBGE cidades segundo o estado selecionado
  useEffect(() => {
    async function getCities() {
      try {
        const response = await ibge.get(`/estados/${selectedUf}/municipios?orderBy=nome`)
        setCities(response.data)        
      } catch (error) {
        
      }
    }
    if ((selectedUf !== '') && (selectedUf !== "0") )
      getCities();

  },[selectedUf])
  
  //Identificando posição do clique no mapa
  function LocationMarker() {
    const map = useMapEvents({
      click(event: LeafletMouseEvent) {
        setSelectedPosition([
          event.latlng.lat,
          event.latlng.lng
        ]);
      },
      locationfound(e) {
        map.flyTo({
          lat: initialPosition[0],
          lng: initialPosition[1]
        }, map.getZoom())
      }
    })    
    return selectedPosition === null ? null : (
      <Marker position={{
        lat: selectedPosition[0],
        lng: selectedPosition[1]
      }}>
        <Popup>Click aqui!</Popup>
      </Marker>
    )
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const {name, value} = event.target;
    setFormData({
      ...formData,
      [name]: value
    }) 
  }

  function handleSelectItem(id: number) {
    const alreadySelected = selectedItems.findIndex(item => item === id);
    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== id);
      setSelectedItems(filteredItems)
    } else {
      setSelectedItems([...selectedItems, id])  
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    const data = new FormData();
    data.append('name', formData.name)
    data.append('email', formData.email)
    data.append('whatsapp', formData.whatsapp)
    data.append('uf', selectedUf)
    data.append('city', selectedCity)
    data.append('latitude', String(selectedPosition[0]))
    data.append('longitude', String(selectedPosition[1]))
    data.append('items', selectedItems.join(','))
    if (selectedFile) {
      data.append('image', selectedFile)
    }  

    console.log('Dados', data)
    const response = await api.post('/points', data);
    console.log(response)

    alert('Ponto de coleta cadastrado com sucesso')
    history.push('/')
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>
        <Link to="/" >
          <FiArrowLeft />
          Voltar para Home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br/>
        ponto de coleta</h1>

        <Dropzone onFileUploaded={setSelectedFile} />

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input 
               type="text"
               name="name"
               id="name"
               onChange={handleInputChange}
            />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input 
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>  
            <div className="field">
              <label htmlFor="whatsapp">WhastApp</label>
              <input 
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>
          
          <MapContainer center={{
            lat: initialPosition[0],
            lng: initialPosition[1]
          }} zoom={15} >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker />
          </MapContainer>

          <div className="field-group">
            <div className="field">

              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" onChange={handleSelectUf} >
                <option value="0">Selecione uma UF</option>

                {ufs && ufs.map(uf => (
                  <option value={uf.sigla} key={uf.id}>{uf.nome} ({uf.sigla})</option>
                ))}

              </select>

            </div>
            <div className="field">

              <label htmlFor="city">Cidade</label>
              <select name="city" id="city" onChange={handleSelectCity} >
                <option value="0">Selecione uma Cidade</option>

                {cities && cities.map(city => (
                  <option value={city.nome} key={city.id}>{city.nome}</option>
                ))}
                
              </select>

            </div>

          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Itens de coleta</h2>
            <span>Selecione um ou mais intes de coleta</span>
          </legend>

          <ul className="items-grid">

            {items && items.map(item => (
              <li 
                key={item.id} 
                onClick={() => handleSelectItem(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : ''}  
              >
                <img src={item.image_url} alt={item.title}/>
                <span>{item.title}</span>
              </li>
            ))}

          </ul>
        </fieldset>
        <button type="submit">
          Cadastrar ponto de coleta
        </button>
      </form>
    </div>
  )
}

export default CreatePoint;