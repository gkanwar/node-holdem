import React from 'react';
import {render} from 'react-dom';
import Game from './components/Game';
import Version from './components/Version';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

const root = document.getElementById('root');
render(<Game/>, root);
const version = document.getElementById('version');
render(<Version/>, version);
