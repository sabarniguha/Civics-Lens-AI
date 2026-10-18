import React from 'react';
import {
  Construction,
  Zap,
  Trash2,
  Droplets,
  Trees,
  AlertTriangle,
  Paintbrush,
  HelpCircle,
  LucideProps,
} from 'lucide-react';
import { IssueCategory } from '../types';

interface Props extends LucideProps {
  category: IssueCategory;
}

export const CategoryIcon: React.FC<Props> = ({ category, ...props }) => {
  switch (category) {
    case 'Potholes & Road Damage':
      return <Construction {...props} />;
    case 'Streetlights & Electrical':
      return <Zap {...props} />;
    case 'Sanitation & Illegal Dumping':
      return <Trash2 {...props} />;
    case 'Water, Sewer & Drainage':
      return <Droplets {...props} />;
    case 'Parks & Public Facilities':
      return <Trees {...props} />;
    case 'Traffic & Pedestrian Safety':
      return <AlertTriangle {...props} />;
    case 'Graffiti & Vandalism':
      return <Paintbrush {...props} />;
    case 'Other Community Issues':
    default:
      return <HelpCircle {...props} />;
  }
};
