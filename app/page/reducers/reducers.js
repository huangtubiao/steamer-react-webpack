/*
 * Reducers，Redux提供的combineReducers函数可以帮助我们把reducer组合在一起，
 * 这样我们就可以把Reducers拆分成一个个小的Reducer来管理Store了；
 * Reducer，Store 收到 Action 以后，必须给出一个新的 State，这样 View 才会发生变化。这种 State 的计算
 * 过程叫做 Reducer。(用户发出 Action，Store 自动调用 Reducer，并且传入两个参数：当前 State 和收到的 Action。 Reducer 会返回新的 State。)
 * combineReducers() 做的就是产生一个整体的 Reducer 函数。该函数根据 State 的 key 去执行相应的子 Reducer
 */
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux'
import merge from 'lodash.merge';
import { getItem, setItem } from 'utils';
import initialState from '../stores/stores';
import {
    GET_NEWS_LIST,
    GET_TOP_NEWS,
    GET_COMMENT_LIST, 
    GET_NEWS_DETAIL, 
} from '../common/constants/constants';
import {
    GET_ARGS,
    TABS_UPDATE,
    TOGGLE_CONTENT,
    TOGGLE_LIST_LOADING,
    TOGGLE_SPIN_LOADING,
    LIKE_NEWS,
    DISLIKE_NEWS,
    GET_LOCAL_LIKE,
} from '../actions/actions';


var news = function(state = initialState.news, action) {
    let listInfoMap = {
        10: 'listLatest',  // 最新新闻
        11: 'listLike',    //  收藏新闻
    };
    switch(action.type) {

        case GET_TOP_NEWS + '_SUCCESS':

            if (!action.data || !action.data.idlist || action.data.idlist.length === 0) {
                return state;
            }

            var idlist = action.data.idlist,
                newState = merge({}, state);

            newState.ids = merge([], idlist[0].ids);
            newState.listLatest = merge([], newState.listLatest.concat(idlist[0].newslist));

            return newState;


        case GET_NEWS_LIST + '_ON':
            var newState = merge({}, state);
            newState.listInfo['listLatest'].isLoading = true;

            return newState;

        case GET_NEWS_LIST + '_SUCCESS':

            if (!action.data || !action.data.newslist) {
                return state;
            }

            var newState = merge({}, state),
                listInfo = {
                    curPage: (++newState.listInfo['listLatest'].curPage),
                    isLoading: false,
                };

            newState.listInfo['listLatest'] = merge({}, newState.listInfo['listLatest'], listInfo);
            newState['listLatest'] = newState['listLatest'].concat(action.data.newslist);

            return newState;

        case GET_NEWS_LIST + '_ERROR':
            var newState = merge({}, state);
            newState.listInfo['listLatest'].isLoading = false;

            return newState;

        case LIKE_NEWS:
            if (!action.value) {
                return state;
            }

            var newState = merge({}, state),
                isDuplicate = false;

            newState['listLike'].map((item, index) => {
                if (item.id === action.value.id) {
                    isDuplicate = true;
                }
            });

            if (isDuplicate) {
                return newState;
            }

            newState['listLike'] = newState['listLike'].concat(action.value);
            setItem('like-list', JSON.stringify(newState['listLike']));

            return newState;

        case DISLIKE_NEWS:
            if (!action.value) {
                return state;
            }

            var newState = merge({}, state);
            newState['listLike'] = newState['listLike'].filter((item, index) => {
                return (item.id !== action.value.id);
            });
            setItem('like-list', JSON.stringify(newState['listLike']));

            return newState;

        default:
            return state;
    }
};

var details = function(state = initialState.details, action) {
    switch (action.type) {
        case GET_NEWS_DETAIL + '_SUCCESS':
            var newState = merge({}, state);
            if (!action.data || !action.data.content) {
                return newState;
            }
            newState[action.param.news_id] = action.data.content;
            return newState;
        default:
            return state;
    }
};

var comments = function(state = initialState.comments, action) {
    switch (action.type) {
        case GET_COMMENT_LIST + '_SUCCESS':
            var newState = merge({}, state);
            if (!action.data || !action.data.comments || !action.data.comments.list) {
                return newState;
            }

            newState[action.param.comment_id] = action.data.comments.list;
            return newState;
        default:
            
            return state;
    }
};

var args = function(state = initialState.args, action) {
    switch(action.type) {
        case GET_ARGS:
            return merge({}, state, action.value);
        default:
            return state;
    }
};

var tabs = function(state = initialState.tabs, action) {
    switch(action.type) {
        case TABS_UPDATE:
            return action.value;
        default:
            return state;
    }
};

var listLoading = function(state = initialState.listLoading, action) {
    switch(action.type) {
        case TOGGLE_LIST_LOADING:
            return action.value;
            break;
        default:
            return state;
    }
};

var spinLoading = function(state = initialState.spinLoading, action) {
    switch(action.type) {
        case TOGGLE_SPIN_LOADING:
            return action.value;
            break;
        default:
            return state;
    }
};


const rootReducer = combineReducers({
    routing: routerReducer,
    args,
    tabs,
    news,
    details,
    comments,
    listLoading,
    spinLoading,
});

export default rootReducer;
