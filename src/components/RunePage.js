import React, { Component, PropTypes } from 'react';
import { View, Text, Image, ListView } from 'react-native';
import { MediaQueryStyleSheet } from 'react-native-responsive';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Immutable from 'immutable';

const styles = MediaQueryStyleSheet.create(
  {
    root: {
      flex: -1,
    },
    runeImage: {
      width: 50,
      height: 50,
      position: 'relative',
      marginRight: 18,
    },
    runeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 8,
      paddingBottom: 8,
      borderColor: '#BBB',
      borderBottomWidth: 1,
    },
    countText: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 18,
      height: 18,
      textAlign: 'center',
      textAlignVertical: 'center',
      fontSize: 11,
      backgroundColor: 'black',
      color: 'white',
      borderRadius: 50,
    },
    dataCol: {
      flex: 1,
    },
    titleText: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    descriptionText: {
      fontSize: 12,
    },
  }, {
    '@media (min-device-width: 600)': {
      runeImage: {
        width: 70,
        height: 70,
      },
      countText: {
        width: 24,
        height: 24,
        fontSize: 14,
      },
      titleText: {
        fontSize: 16,
      },
      descriptionText: {
        fontSize: 14,
      },
    },
  },
);

function getRuneImageUri(runeImage) {
  return `rune_${runeImage}`.replace('.png', '');
}

function renderRow(rune, sectionId, rowId) {
  return (<View style={styles.runeRow} key={rowId}>
    <Image style={styles.runeImage} source={{ uri: getRuneImageUri(rune.getIn(['image', 'full'])) }} >
      <Text style={styles.countText}>x{rune.get('count') || rune.get('rank')}</Text>
    </Image>
    <View style={styles.dataCol}>
      <Text style={styles.titleText}>{rune.get('name')}</Text>
      <Text style={styles.descriptionText}>{rune.get('description')}</Text>
    </View>
  </View>);
}

class RunePage extends Component {
  constructor(props) {
    super(props);

    this.ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => !Immutable.is(r1, r2),
    });
  }

  render() {
    const runes = this.props.page.get('runes');

    if (runes.size === 0) {
      return <Text style={styles.messageText}>Esta página de runas está vacía.</Text>;
    }

    return (<ListView
      style={styles.root}
      contentContainerStyle={styles.container}
      dataSource={this.ds.cloneWithRows(runes.toArray())}
      renderRow={renderRow}
    />);
  }
}

RunePage.propTypes = {
  page: ImmutablePropTypes.mapContains({
    name: PropTypes.string,
    runes: ImmutablePropTypes.listOf(ImmutablePropTypes.mapContains({
      runeId: PropTypes.number.isRequired,
      count: PropTypes.number,
      rank: PropTypes.number,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      image: ImmutablePropTypes.mapContains({
        full: PropTypes.string.isRequired,
      }),
    })).isRequired,
  }),
};

export default RunePage;
