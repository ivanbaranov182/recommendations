import '@styles/styles.scss';

import React from 'react';
import ReactDom from 'react-dom';

import { Crawler } from '@components/crawler/Crawler';
import { ArticleList } from '@components/lenta/ArticleList';

new Crawler();

ReactDom.render(<ArticleList />, document.getElementById('recommendations-root'));
