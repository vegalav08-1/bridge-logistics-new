'use client';
import { BackButton } from '@/components/layout/BackButton';
import SearchHeader from './components/SearchHeader';
import SearchBox from './components/SearchBox';
import SearchResults from './components/SearchResults';

export default function SearchPage(){
  return (
    <>
      <SearchHeader />
      <div className="px-4 py-3">
        {/* Заголовок с кнопкой назад */}
        <div className="flex items-center gap-3 mb-4">
          <BackButton />
          <h1 className="text-lg font-semibold">Поиск</h1>
        </div>
        
        <SearchBox />
        <SearchResults />
      </div>
    </>
  );
}

