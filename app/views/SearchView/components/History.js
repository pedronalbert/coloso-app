import React, { Component, PropTypes } from 'react';
import { View, StyleSheet, Text, ListView, TouchableWithoutFeedback } from 'react-native';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Immutable from 'immutable';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MKButton } from 'react-native-material-kit';
import I18n from 'i18n-js';
import colors from '../../../utils/colors';

const styles = StyleSheet.create({
  root: {
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  ListView: {
    flex: -1,
  },
  dataContainer: {
    flexDirection: 'row',
    height: 50,
    width: null,
    alignItems: 'center',
    flex: 1,
  },
  region: {
    width: 50,
    height: 25,
    backgroundColor: colors.primary,
    marginRight: 16,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: 'white',
    borderRadius: 5,
    fontSize: 12,
  },
  summonerName: {
    fontSize: 16,
  },
  removeIcon: {
    marginHorizontal: 8,
  },
});


class History extends Component {
  constructor(props) {
    super(props);

    this.handleOnPressHistoryEntry = this.handleOnPressHistoryEntry.bind(this);
    this.handleOnPressDeleteIcon = this.handleOnPressDeleteIcon.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => !Immutable.is(r1, r2),
    });
  }

  handleOnPressHistoryEntry(summonerName, region) {
    this.props.onPressHistoryEntry(summonerName, region);
  }

  handleOnPressDeleteIcon(summonerName, region) {
    if (this.props.onPressDelete) {
      this.props.onPressDelete(summonerName, region);
    }
  }

  renderRow(historyEntry, sectionId, rowId) {
    const summonerName = historyEntry.get('summonerName');
    const region = historyEntry.get('region');

    return (<View style={[styles.root, parseInt(rowId, 10) === 0 && { borderTopWidth: 1 }]}>
      <MKButton
        key={rowId}
        rippleColor="rgba(0,0,0,0.1)"
        style={styles.dataContainer}
        onPress={() => {
          this.handleOnPressHistoryEntry(summonerName, region);
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.region}>{region.toUpperCase()}</Text>
          <Text style={styles.summonerName}>{summonerName}</Text>
        </View>
      </MKButton>
      <TouchableWithoutFeedback
        onPress={() => {
          this.handleOnPressDeleteIcon(summonerName, region);
        }}
      >
        <Icon name="delete" size={24} style={styles.removeIcon} />
      </TouchableWithoutFeedback>
    </View>);
  }

  render() {
    const { historyEntries } = this.props;

    if (historyEntries.size <= 0) {
      return <Text>{I18n.t('empty_history')}</Text>;
    }


    return (<ListView
      style={[styles.listView, this.props.style]}
      dataSource={this.dataSource.cloneWithRows(this.props.historyEntries.toArray())}
      renderRow={this.renderRow}
      automaticallyAdjustContentInsets={false}
      enableEmptySections
    />);
  }
}

History.defaultProps = {
  historyEntries: Immutable.List([]),
};

History.propTypes = {
  historyEntries: ImmutablePropTypes.listOf(ImmutablePropTypes.mapContains({
    summonerName: PropTypes.string,
    region: PropTypes.string,
  })),
  style: View.propTypes.style,
  onPressHistoryEntry: PropTypes.func.isRequired,
  onPressDelete: PropTypes.func,
};

export default History;
