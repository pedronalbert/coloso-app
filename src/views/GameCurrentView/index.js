import GameCurrentView from './containers/GameCurrentContainer';
import GameCurrentReducer from './modules/GameCurrentReducer';
import { injectReducer } from '../../redux/store';

injectReducer('gameCurrent', GameCurrentReducer);

export default GameCurrentView;
