import React, { Component, PropTypes } from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import SummonerProfileViewToolbar from './SummonerProfileViewToolbar';
import SummonerProfileViewActions from '../../redux/actions/SummonerProfileViewActions';
import LeagueEntryView from './components/LeagueEntryView';
import ChampionsMasteryView from './components/ChampionsMasteryView';
import GamesRecentView from './components/GamesRecentView';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

class SummonerProfileView extends Component {
  constructor(props) {
    super(props);

    this.handleOnChangeTab = this.handleOnChangeTab.bind(this);
  }

  componentWillMount() {
    this.props.fetchSummonerData(this.props.summonerId, this.props.region);
    this.props.fetchLeagueEntry(this.props.summonerId, this.props.region);
  }


  handleOnChangeTab({ i: tabIndex }) {
    if (tabIndex === 1) {
      // ChampionsMastery
      const { isFetching, fetched } = this.props.championsMastery;

      if (!isFetching && !fetched) {
        this.props.fetchChampionsMastery(this.props.summonerId, this.props.region);
      }
    }

    if (tabIndex === 2) {
      // GamesRecent
      const { isFetching, fetched } = this.props.gamesRecent;

      if (!isFetching && !fetched) {
        this.props.fetchGamesRecent(this.props.summonerId, this.props.region);
      }
    }
  }

  render() {
    return (<View style={styles.root}>
      <SummonerProfileViewToolbar
        summonerData={this.props.summonerData}
        onPressBackButton={() => { Actions.pop(); }}
      />
      <ScrollableTabView
        initialPage={0}
        renderTabBar={() => <ScrollableTabBar />}
        onChangeTab={this.handleOnChangeTab}
      >
        <LeagueEntryView tabLabel="Clasificatoria" leagueEntry={this.props.leagueEntry} />
        <ChampionsMasteryView tabLabel="Maestria" championsMastery={this.props.championsMastery} />
        <GamesRecentView tabLabel="Historial" gamesRecent={this.props.gamesRecent} />
      </ScrollableTabView>
    </View>);
  }

}

SummonerProfileView.propTypes = {
  summonerId: PropTypes.number,
  region: PropTypes.string,
  fetchSummonerData: PropTypes.func,
  fetchLeagueEntry: PropTypes.func,
  fetchChampionsMastery: PropTypes.func,
  fetchGamesRecent: PropTypes.func,
  leagueEntry: PropTypes.shape({}),
  summonerData: PropTypes.shape({}),
  championsMastery: PropTypes.shape({
    isFetching: PropTypes.bool,
    fetched: PropTypes.bool,
  }),
  gamesRecent: PropTypes.shape({
    isFetching: PropTypes.bool.isRequired,
    fetched: PropTypes.bool.isRequired,
  }),
};

function mapStateToProps(state) {
  const summonerData = state.summonerProfileView.get('summonerData').toJS();
  const leagueEntry = state.summonerProfileView.get('leagueEntry').toJS();
  const championsMastery = state.summonerProfileView.get('championsMastery').toJS();
  const gamesRecent = state.summonerProfileView.get('gamesRecent').toJS();

  return {
    summonerData,
    leagueEntry,
    championsMastery,
    gamesRecent,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchSummonerData: (summonerId, region) => {
      dispatch(SummonerProfileViewActions.fetchSummonerData(summonerId, region));
    },

    fetchLeagueEntry: (summonerId, region) => {
      dispatch(SummonerProfileViewActions.fetchLeagueEntry(summonerId, region));
    },

    fetchChampionsMastery: (summonerId, region) => {
      dispatch(SummonerProfileViewActions.fetchChampionsMastery(summonerId, region));
    },

    fetchGamesRecent: (summonerId, region) => {
      dispatch(SummonerProfileViewActions.fetchGamesRecent(summonerId, region));
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SummonerProfileView);
