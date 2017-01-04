import React, { PureComponent, PropTypes } from 'react';
import Drawer from 'react-native-drawer';
import { Actions, DefaultRenderer } from 'react-native-router-flux';
import { connect } from 'react-redux';
import OwnerAccountActions from '../redux/actions/OwnerAccountActions';
import SearchViewActions from '../redux/actions/SearchViewActions';
import SideMenu from './SideMenu';

class MainDrawer extends PureComponent {
  constructor(props) {
    super(props);

    this.handleOnPressSearchGame = this.handleOnPressSearchGame.bind(this);
  }

  componentWillMount() {
    this.props.loadAccount();
  }

  handleOnPressSearchGame() {
    if (!this.props.isSearchingGame) {
      const { ownerAccount } = this.props;
      Actions.search_view();
      this.drawer.close();
      this.props.searchGame(ownerAccount.summonerName, ownerAccount.region);
    }
  }

  render() {
    const state = this.props.navigationState;
    const children = state.children;
    const styles = {};

    if (state.open) {
      styles.mainOverlay = {
        backgroundColor: 'rgba(0,0,0,0.4)',
      };
    }

    return (<Drawer
      open={state.open}
      styles={styles}
      onOpen={() => Actions.refresh({ key: state.key, open: true })}
      onClose={() => Actions.refresh({ key: state.key, open: false })}
      type="overlay"
      content={<SideMenu
        ownerAccount={this.props.ownerAccount}
        onPressSearchGame={this.handleOnPressSearchGame}
      />}
      captureGestures
      panOpenMask={0.05}
      panCloseMask={0.2}
      tapToClose
      negotiatePan
      ref={(drawer) => { this.drawer = drawer; }}
    >
      <DefaultRenderer navigationState={children[0]} onNavigate={this.props.onNavigate} />
    </Drawer>);
  }
}

MainDrawer.propTypes = {
  navigationState: PropTypes.shape({}),
  isSearchingGame: PropTypes.bool,
  onNavigate: PropTypes.func,
  ownerAccount: PropTypes.shape({}),
  loadAccount: PropTypes.func,
  searchGame: PropTypes.func,
};

function mapStateToProps(state) {
  return {
    ownerAccount: state.ownerAccount.toJS(),
    isSearchingGame: state.searchView.get('isSearching'),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loadAccount: () => {
      dispatch(OwnerAccountActions.loadAccount());
    },

    searchGame: (summonerName, region) => {
      dispatch(SearchViewActions.setSummonerName(summonerName));
      dispatch(SearchViewActions.setRegion(region));
      dispatch(SearchViewActions.setSearchType('GAME_SEARCH'));
      dispatch(SearchViewActions.searchGame(summonerName, region));
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MainDrawer);
