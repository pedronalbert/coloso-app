import SummonerProfile from './containers/SummonerProfileContainer';
import SummonerProfileReducer from './modules/SummonerProfileReducer';
import { injectReducer } from '../../redux/store';

injectReducer('summonerProfile', SummonerProfileReducer);

export default SummonerProfile;
