import axios from 'axios'

export const baseURL = 'https://servicodados.ibge.gov.br/api/v1/localidades';

const ibgeLocal = axios.create({
  baseURL
})

export default ibgeLocal;