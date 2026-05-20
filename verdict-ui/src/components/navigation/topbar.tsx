import UserMenu from './user-menu';

export default function Topbar(){
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b bg-transparent" style={{height: 'var(--header-height)'}}>
      <div className="font-semibold">Verdict</div>
      <UserMenu />
    </header>
  );
}
