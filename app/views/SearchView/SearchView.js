import React, { Component, PropTypes } from 'react';
import { View, Image, Picker, Text, Keyboard, Dimensions, BackAndroid } from 'react-native';
import { connect } from 'react-redux';
import { MKTextField, MKButton, MKSpinner, MKRadioButton } from 'react-native-material-kit';
import { MediaQueryStyleSheet, MediaQuery } from 'react-native-responsive';
import { Actions } from 'react-native-router-flux';
import Snackbar from 'react-native-android-snackbar';
import SearchViewToolbar from './components/SearchViewToolbar';
import HistoryModal from './components//HistoryModal';
import SearchViewActions from '../../redux/actions/SearchViewActions';
import SearchHistoryActions from '../../redux/actions/SearchHistoryActions';
import colors from '../../utils/colors';
import styleUtils from '../../utils/styleUtils';
import regionHumanize from '../../utils/regionHumanize';
import homeImage from '../../assets/poro_wallpaper.jpg';

// TODO: Agregar busquedas recientes

const PROFILE_SEARCH = 'PROFILE_SEARCH';
const GAME_SEARCH = 'GAME_SEARCH';

const styles = MediaQueryStyleSheet.create(
  {
    root: {
      flex: 1,
    },

    container: {
      padding: 16,
      flex: 1,
      justifyContent: 'space-around',
    },

    label: {
      fontWeight: 'bold',
      fontSize: 16,
    },

    formContainer: {
      overflow: 'scroll',
    },

    formGroup: {
      marginBottom: 8,
    },

    inputName: {
      flex: 1,
      height: 47,
      marginLeft: 10,
    },

    radioGroup: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    inputRegion: {
      flex: 1,
      height: 50,
    },

    searchButton: {
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      height: 40,
    },

    searchButtonText: {
      color: '#FFFFFF',
    },

    spinnerContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  },
  {
    '@media (min-device-width: 600)': {
      formGroup: {
        marginBottom: 16,
      },
      container: {
        paddingLeft: 40,
        paddingRight: 40,
      },
      inputName: {
        marginLeft: 16,
      },
      inputRegion: {
        marginLeft: 8,
      },
      radioGroup: {
        flex: 1,
      },
    },
  },
);

class SearchView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      summonerName: null,
      region: 'na',
      searchType: PROFILE_SEARCH,
      visibleHeight: Dimensions.get('window').height,
    };

    this.handlePressSearchButton = this.handlePressSearchButton.bind(this);
    this.handleTextChangeSummonerName = this.handleTextChangeSummonerName.bind(this);
    this.handleChangeRegion = this.handleChangeRegion.bind(this);
    this.handleOnChekedChangeProfileButton = this.handleOnChekedChangeProfileButton.bind(this);
    this.handleOnPressHistoryButton = this.handleOnPressHistoryButton.bind(this);
    this.handleOnPressHistoryEntry = this.handleOnPressHistoryEntry.bind(this);
    this.getHomeImageStyle = this.getHomeImageStyle.bind(this);
    this.renderButton = this.renderButton.bind(this);
    this.renderSpinner = this.renderSpinner.bind(this);
    this.radioGroup = new MKRadioButton.Group();
  }

  componentWillMount() {
    this.props.loadSearchHistory();
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.handleKeyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.handleKeyboardDidHide.bind(this));
    this.backAndroidListener = BackAndroid.addEventListener('hardwareBackPress', this.handleOnBackAndroid.bind(this));
  }

  componentDidUpdate() {
    if (this.props.searchError) {
      Snackbar.show(this.props.errorMessage, { duration: Snackbar.LONG });
      return this.props.clearSearchError();
    }

    if (this.props.summonerFoundId > 0) {
      Actions.summoner_profile_view({
        summonerId: this.props.summonerFoundId,
        region: this.props.summonerFoundRegion,
      });
      this.props.clearFoundData();
    } else if (this.props.gameFound) {
      this.props.clearFoundData();
      Actions.game_current();
    }

    return null;
  }
  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
    this.backAndroidListener.remove();
  }


  getHomeImageStyle() {
    const { width: deviceWidth } = Dimensions.get('window');
    let imageWidth;
    let imageHeight;
    let acceptableHeight;
    let acceptableWidth;
    const formGroupHeight = 400; // Para calcular en la tablet con teclado abierto

    if (deviceWidth < 600) {
      acceptableWidth = deviceWidth - 32;
      acceptableHeight = this.state.visibleHeight * 0.4;
    } else {
      acceptableWidth = deviceWidth - 80;
      acceptableHeight = this.state.visibleHeight - formGroupHeight;
    }


    // Si no hay espacio suficiente
    if (this.state.visibleHeight < 350) {
      return { width: 0, height: 0 };
    }

    // Definimos la imagen con respecto al alto acceptableHeigh
    imageHeight = acceptableHeight;
    imageWidth = imageHeight * 2;

    if (imageWidth > acceptableWidth) {
      const widthDiff = imageWidth - acceptableWidth;
      const resizePercent = widthDiff / imageWidth;

      imageWidth -= imageWidth * resizePercent;
      imageHeight -= imageHeight * resizePercent;
    }

    return {
      width: imageWidth,
      height: imageHeight,
      alignSelf: 'center',
      borderRadius: 5,
    };
  }

  handleOnBackAndroid() {
    if (this.historyModal.isOpen()) {
      this.historyModal.close();
      return true;
    }

    return false;
  }

  handleChangeRegion(newRegion) {
    this.setState({ region: newRegion });
  }

  handleTextChangeSummonerName(newSummonerName) {
    this.setState({ summonerName: newSummonerName });
  }

  handlePressSearchButton() {
    Snackbar.dismiss();
    Keyboard.dismiss();
    this.props.addSearchEntry(this.state.summonerName, this.state.region);

    if (this.state.searchType === PROFILE_SEARCH) {
      this.props.searchSummoner(this.state.summonerName, this.state.region);
    } else if (this.state.searchType === GAME_SEARCH) {
      this.props.searchGame(this.state.summonerName, this.state.region);
    }
  }

  handleKeyboardDidHide() {
    this.setState({
      visibleHeight: Dimensions.get('window').height,
    });
  }

  handleOnChekedChangeProfileButton({ checked }) {
    if (checked) {
      this.setState({ searchType: PROFILE_SEARCH });
    } else {
      this.setState({ searchType: GAME_SEARCH });
    }
  }

  handleKeyboardDidShow(e) {
    const newSize = Dimensions.get('window').height - e.endCoordinates.height;

    this.setState({
      visibleHeight: newSize,
    });
  }

  handleOnPressHistoryButton() {
    this.historyModal.open();
  }

  handleOnPressHistoryEntry(summonerName, region) {
    this.historyModal.close();
    this.setState({ summonerName, region });
  }

  renderSpinner() {
    if (this.props.isSearching) {
      return (<View style={styles.spinnerContainer}>
        <MKSpinner strokeColor={colors.spinnerColor} />
      </View>);
    }

    return null;
  }

  renderButton() {
    if (!this.props.isSearching && this.state.visibleHeight > 300) {
      return (<MKButton
        style={styles.searchButton}
        onPress={this.handlePressSearchButton}
      >
        <Text style={styles.searchButtonText}>BUSCAR INVOCADOR</Text>
      </MKButton>);
    }

    return null;
  }

  render() {
    const regions = ['na', 'lan', 'las', 'br', 'eunw', 'eune', 'oce', 'jp', 'kr', 'ru', 'tr'];

    return (<View style={styles.root}>
      <SearchViewToolbar onPressHistoryButton={this.handleOnPressHistoryButton} />
      <View style={styles.container}>
        <Image
          style={this.getHomeImageStyle()}
          source={homeImage}
        />

        <View style={styles.formContainer}>
          <View style={styles.formGroup}>
            <MediaQuery minDeviceWidth={600}>
              <Text style={styles.label}>Nombre de Invocador: </Text>
            </MediaQuery>
            <MKTextField
              style={styles.inputName}
              value={this.state.summonerName}
              onTextChange={this.handleTextChangeSummonerName}
              placeholder="Nombre de invocador"
            />
          </View>
          <View style={styles.formGroup}>
            <MediaQuery minDeviceWidth={600}>
              <Text style={styles.label}>Region: </Text>
            </MediaQuery>
            <Picker
              style={styles.inputRegion}
              onValueChange={this.handleChangeRegion}
              selectedValue={this.state.region}
            >
              {regions.map((region, index) => <Picker.Item
                key={index}
                label={regionHumanize(region)}
                value={region}
              />)}
            </Picker>
          </View>
          <View style={styleUtils.flexRow}>
            <View style={styles.radioGroup}>
              <MKRadioButton
                group={this.radioGroup}
                onCheckedChange={this.handleOnChekedChangeProfileButton}
                checked
              />
              <Text>Perfil de invocador</Text>
            </View>
            <View style={styles.radioGroup}>
              <MKRadioButton group={this.radioGroup} />
              <Text>Juego actual</Text>
            </View>
          </View>
        </View>

        {this.renderSpinner()}
        {this.renderButton()}
      </View>

      <HistoryModal
        ref={(historyModal) => { this.historyModal = historyModal; }}
        historyEntries={this.props.searchHistoryEntries}
        onPressHistoryEntry={this.handleOnPressHistoryEntry}
      />
    </View>);
  }
}

SearchView.propTypes = {
  isSearching: PropTypes.bool,
  searchSummoner: PropTypes.func,
  clearSearchError: PropTypes.func,
  clearFoundData: PropTypes.func,
  summonerFoundId: PropTypes.number,
  summonerFoundRegion: PropTypes.string,
  gameFound: PropTypes.bool.isRequired,
  searchError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  searchGame: PropTypes.func,
  searchHistoryEntries: PropTypes.arrayOf(PropTypes.shape({})),
  loadSearchHistory: PropTypes.func.isRequired,
  addSearchEntry: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  const searchViewState = state.searchView;

  return {
    isSearching: searchViewState.get('isSearching'),
    searchError: searchViewState.get('searchError'),
    errorMessage: searchViewState.get('errorMessage'),
    summonerFoundId: searchViewState.get('summonerFoundId'),
    summonerFoundRegion: searchViewState.get('summonerFoundRegion'),
    gameFound: searchViewState.get('gameFound'),
    searchHistoryEntries: state.searchHistory.get('entries').toJS(),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    searchSummoner: (summonerName, region) => {
      dispatch(SearchViewActions.searchSummoner(summonerName, region));
    },

    searchGame: (summonerId, region) => {
      dispatch(SearchViewActions.searchGame(summonerId, region));
    },

    clearSearchError: () => {
      dispatch(SearchViewActions.clearSearchError());
    },

    clearFoundData: () => {
      dispatch(SearchViewActions.clearFoundData());
    },

    loadSearchHistory: () => {
      dispatch(SearchHistoryActions.loadEntries());
    },

    addSearchEntry: (summonerName, region) => {
      dispatch(SearchHistoryActions.addEntry(summonerName, region));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchView);
