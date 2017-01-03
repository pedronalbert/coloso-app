import React, { Component, PropTypes } from 'react';
import { StyleSheet, ListView, View } from 'react-native';
import _ from 'lodash';
import LoadingScreen from '../../../../components/LoadingScreen';
import ErrorScreen from '../../../../components/ErrorScreen';
import SeasonSelector from '../../../../components/SeasonSelector';
import Summary from './Summary';

const styles = StyleSheet.create({
  root: {},
  container: {
    marginTop: 8,
  },
  headerSelector: {
    paddingLeft: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
});

function filterEmpty(summaries) {
  return _.filter(summaries, (summary) => {
    if (_.isNumber(summary.wins) || _.isNumber(summary.losses)) {
      return true;
    }

    return false;
  });
}

class SummonerSumaryView extends Component {
  constructor(props) {
    super(props);

    this.dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
    });
  }
  render() {
    if (this.props.summary.fetched) {
      const summaries = filterEmpty(this.props.summary.playerStatSummaries);

      return (
        <View>
          <View style={styles.headerSelector}>
            <SeasonSelector
              initialValue={this.props.summary.season}
              onChangeSelected={this.props.onChangeSeason}
              disabled={this.props.summary.isFetching}
            />
          </View>
          <View style={styles.container}>
            <ListView
              dataSource={this.dataSource.cloneWithRows(summaries)}
              renderRow={(summary, sectionId, rowId) => <Summary key={rowId} summary={summary} />}
            />
          </View>
        </View>
      );
    } else if (this.props.summary.isFetching) {
      return <LoadingScreen />;
    }

    return (<ErrorScreen
      message={this.props.summary.errorMessage}
      onPressRetryButton={this.props.onPressRetryButton}
      retryButton
    />);
  }
}

SummonerSumaryView.propTypes = {
  summary: PropTypes.shape({
    isFetching: PropTypes.bool.isRequired,
    fetched: PropTypes.bool.isRequired,
    playerStatSummaries: PropTypes.arrayOf(PropTypes.shape({})),
    season: PropTypes.string.isRequired,
    errorMessage: PropTypes.string,
  }),
  onPressRetryButton: PropTypes.func.isRequired,
  onChangeSeason: PropTypes.func.isRequired,
};

export default SummonerSumaryView;