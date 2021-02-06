import React, { FC } from 'react';
import Twig from 'twig';

const template = Twig.twig({
  data: '<p>The {{ baked_good }} is a lie.</p>',
});

// console.log(template.render({ baked_good: 'cupcake' }));

export const ArticleCustomView: FC = () => {
  return <div dangerouslySetInnerHTML={{ __html: template.render({ baked_good: 'cupcake' }) }} />;
};
