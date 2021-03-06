import React, { Component } from 'react'
import {
  Text,
  View,
  RefreshControl,
  SectionList,
  Animated
} from 'react-native'

import { connect } from 'react-redux'
import { getRecommend } from '../../redux/action/recommend.js'
import { changeCommunityType } from '../../redux/action/app'

import HotGameItem from '../../component/HotGameItem'
import NodeItem from '../../component/NodeItem'
import TipItem from '../../component/TipItem'
import CommentItem from '../../component/LatestCommentItem'
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList)

declare var global

const renderSectionHeader = ({ section }) => {
  // console.log(Object.keys(section), section.data[0].length)
  const len = section.data.length
  if (len === 1 && section.data[0].length === 0) return undefined
  return (
    <View style={{
      backgroundColor: section.modeInfo.backgroundColor,
      flex: -1,
      padding: 7,
      marginLeft: 7,
      marginRight: 7,
      elevation: 2
    }}>
      <Text numberOfLines={1}
        style={{ fontSize: 20, color: section.modeInfo.standardColor, textAlign: 'left', lineHeight: 25, marginLeft: 2, marginTop: 2 }}
      >{section.key}</Text>
    </View>
  )
}

class Recommend extends Component<any, any> {
  static navigationOptions = {
    tabBarLabel: '推荐',
    drawerLabel: '推荐'
  }

  constructor(props) {
    super(props)
    this.state = {
      isLoading: true,
      data: {
        hotGames: [],
        nodes: [],
        tips: [],
        comment: [],
        warning: ''
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    // console.log('received', nextProps.data.hotGames.length)
    if (this.props.screenProps.modeInfo.themeName !== nextProps.screenProps.modeInfo.themeName) {
      this.props.screenProps.modeInfo = nextProps.screenProps.modeInfo
    } else if (this.props.data.hotGames.length < nextProps.data.hotGames.length) {
      // this.setState({
      //   isLoading: false
      // })
    } else {
      // if (nextProps.segmentedIndex !== 0) return
      this.setState({
        isLoading: false,
        data: this.props.data
      })
    }
  }

  componentWillMount() {
    if (this.props.data.hotGames.length === 0) {
      this._onRefresh()
    }
  }
  componentWillUnmount() {
    this.setTimeout && clearTimeout(this.setTimeout)
  }

  setTimeout: any = false
  componentDidMount() {
    this.setTimeout = setTimeout(() => {
      this.setState({
        data: this.props.data,
        isLoading: false
      })
    }, 0)
  }

  _onRefresh: any = () => {
    this.setState({
      isLoading: true
    })
    this.props.dispatch(getRecommend())
  }

  _renderItemComponent = (data?, type?) => {
    const { item: rowData } = data
    const { modeInfo, navigation } = this.props.screenProps
    let outter = []
    switch (type) {
      case 0:
        outter = rowData.map((item, index) => (<HotGameItem key={index} {...{
          modeInfo,
          navigation,
          rowData: item
        }}/>))
        break
      case 1:
        outter = rowData.map((item, index) => (<NodeItem key={index} {...{
          modeInfo,
          navigation,
          rowData: item,
          onPress: () => {
            this.props.navigation.navigate('Community', {})
            setTimeout(() => this.props.dispatch(changeCommunityType(item.id)), 0)
          }
        }}/>))
        break
      case 2:
        outter = rowData.map((item, index) => (<TipItem key={index} {...{
          modeInfo,
          navigation,
          rowData: item
        }}/>))
        break
      case 3:
        outter = rowData.map((item, index) => (<CommentItem key={index} {...{
          modeInfo,
          navigation,
          rowData: item
        }}/>))
        break
      default:
        break
    }
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 7, elevation: 2, backgroundColor: modeInfo.backgroundColor}}>
        {outter}
      </View>
    )
  }

  flatlist: any = false
  refreshControl: any = false

  render() {
    const { modeInfo } = this.props.screenProps
    let { data } = this.state

    // console.log(data)
    const sections = Object.keys(data).filter(item => item !== 'warning').map((sectionName, index) => {
      return {
        key: nameMapper[sectionName],
        modeInfo,
        data: [data[sectionName]],
        renderItem: (...args) => this._renderItemComponent(...args, index)
      }
    })
    global.log('recommend re-rendered')
    return (
      <AnimatedSectionList
        enableVirtualization={false}
        ref={flatlist => this.flatlist = flatlist}
        refreshControl={
          <RefreshControl
            refreshing={this.state.isLoading}
            onRefresh={this._onRefresh}
            colors={[modeInfo.accentColor]}
            progressBackgroundColor={modeInfo.backgroundColor}
            ref={ref => this.refreshControl = ref}
          />
        }
        disableVirtualization={true}
        renderScrollComponent={props => <global.NestedScrollView {...props}/>}
        keyExtractor={(item) => `${item.id}`}
        renderItem={this._renderItemComponent}
        renderSectionHeader={renderSectionHeader}
        key={modeInfo.themeName}
        stickySectionHeadersEnabled
        sections={sections}
        style={{
          backgroundColor: modeInfo.background
        }}
      />
    )
  }

}

const nameMapper = {
  'hotGames' : '热门游戏',
  'nodes': '常用节点',
  'tips': '奖杯TIPS',
  'comment': '游戏评论'
}

function mapStateToProps(state) {
  return {
    data: state.recommend
  }
}

export default connect(
  mapStateToProps
)(Recommend)
