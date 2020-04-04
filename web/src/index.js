import React from 'react';
import {render} from 'react-dom';
import Game from './components/Game';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

const root = document.getElementById('root');
render(<Game/>, root);
