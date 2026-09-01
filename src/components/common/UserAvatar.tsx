import React from 'react';
import {
  User,
  Heart,
  Sparkles,
  Star,
  Sun,
  Moon,
  Shield,
  Flame,
  Crown,
  Leaf
} from 'lucide-react';

export const AVATAR_ICONS = [
  { id: 'user', label: 'Профиль', icon: User },
  { id: 'heart', label: 'Сердце', icon: Heart },
  { id: 'sparkles', label: 'Искры', icon: Sparkles },
  { id: 'star', label: 'Звезда', icon: Star },
  { id: 'sun', label: 'Солнце', icon: Sun },
  { id: 'moon', label: 'Луна', icon: Moon },
  { id: 'leaf', label: 'Лист', icon: Leaf },
  { id: 'shield', label: 'Защита', icon: Shield },
  { id: 'crown', label: 'Корона', icon: Crown },
  { id: 'flame', label: 'Огонь', icon: Flame }
];

interface UserAvatarProps {
  avatarId?: string;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ avatarId = 'user', className = 'w-5 h-5' }) => {
  const match = AVATAR_ICONS.find(a => a.id === avatarId);
  if (match) {
    const Icon = match.icon;
    return <Icon className={className} />;
  }
  return <User className={className} />;
};
