import '@styles/styles.scss';

import React from 'react';
import ReactDom from 'react-dom';

import {ArticleList} from '@components/ArticleList/ArticleList';

ReactDom.render(<ArticleList />, document.getElementById('recommendations-root'));
