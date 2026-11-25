import { PiListFill } from 'react-icons/pi';
import './ProfileHeader.css';

function ProfileHeader({ user, lastSync, onOpenMobileMenu }) {
  const initials = user.avatar_initials || user.name?.[0]?.toUpperCase() || '?';
  return (
    <header className="profile-header">
      <button
        className="profile-header__menu-btn"
        type="button"
        onClick={onOpenMobileMenu}
        aria-label="Abrir menu de categorias"
      >
        <PiListFill aria-hidden="true" />
      </button>

      <div className="profile-header__avatar" aria-hidden="true">
        {initials}
      </div>

      <div className="profile-header__info">
        <h1 className="profile-header__name">{user.name}</h1>
        <a className="profile-header__link" href="#perfil">
          Perfil <span aria-hidden="true">›</span>
        </a>
        <p className="profile-header__sync">
          {lastSync ? `Última sincronização: ${lastSync}` : 'Ainda sem sincronização'}
        </p>
      </div>
    </header>
  );
}

export default ProfileHeader;
