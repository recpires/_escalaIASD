import React from 'react';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Check } from 'lucide-react';
import { Calendar } from '../components/Calendar';
import { BibleVerse } from '../components/BibleVerse';
import type { Schedule } from '../types';


export const Dashboard = () => {
  const { currentUser, logout } = useData();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-sda-blue text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-white/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">{currentUser.name}</h1>
              <p className="text-xs text-sda-gold font-medium uppercase tracking-wider">{currentUser.role === 'leader' ? 'Líder' : 'Membro'}</p>
            </div>
          </div>
          <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={handleLogout}>
            <LogOut className="h-5 w-5 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BibleVerse />
        {currentUser.role === 'leader' ? (
          <LeaderDashboard />
        ) : (
          <MemberDashboard />
        )}
      </main>
    </div>
  );
};

const MemberDashboard = () => {
  const { currentUser, setAvailability, availabilities, ministries, schedules } = useData();
  const [selectedDates, setSelectedDates] = React.useState<string[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);

  // Load existing availability
  React.useEffect(() => {
    if (currentUser) {
      const userAvail = availabilities.find(a => a.userId === currentUser.id);
      if (userAvail) {
        setSelectedDates(userAvail.dates);
      }
    }
  }, [currentUser, availabilities]);

  const handleDateClick = (dateStr: string) => {
    setSelectedDates(prev => {
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr);
      } else {
        return [...prev, dateStr];
      }
    });
  };

  const handleSave = () => {
    if (currentUser) {
      setIsSaving(true);
      // Simulate network delay for "feel"
      setTimeout(() => {
        setAvailability(currentUser.id, selectedDates);
        setIsSaving(false);
        alert('Disponibilidade salva com sucesso!');
      }, 500);
    }
  };

  const userMinistries = ministries.filter(m => currentUser?.ministryIds.includes(m.id));
  
  // Find upcoming schedules for this user
  const mySchedules = React.useMemo(() => {
    if (!currentUser) return [];
    return schedules
      .filter((s: Schedule) => s.memberIds.includes(currentUser.id))
      .filter((s: Schedule) => new Date(s.date) >= new Date(new Date().setHours(0,0,0,0))) // Future only
      .sort((a: Schedule, b: Schedule) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [currentUser, schedules]);

  return (
    <div className="space-y-8">
      {/* My Upcoming Schedules */}
      {mySchedules.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-sda-gold/30 bg-gradient-to-r from-white to-orange-50">
          <h2 className="text-xl font-bold text-sda-blue mb-4 flex items-center">
             <Check className="w-6 h-6 mr-2 text-sda-gold" />
             Minhas Escalas Confirmadas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {mySchedules.map(schedule => {
               const ministry = ministries.find(m => m.id === schedule.ministryId);
               return (
                 <div key={schedule.id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="font-bold text-gray-900">{new Date(schedule.date).toLocaleDateString('pt-BR')}</p>
                        <p className="text-sm text-gray-600">{ministry?.name}</p>
                    </div>
                    <div className="h-8 w-1 bg-sda-gold rounded-full"></div>
                 </div>
               );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Minha Disponibilidade</h2>
        <p className="text-gray-600 mb-6 text-sm">
            Selecione no calendário abaixo os dias que você poderá servir na igreja. 
            Isso ajudará seus líderes na confecção das escalas.
        </p>
        
        <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
            <Calendar selectedDates={selectedDates} onDateClick={handleDateClick} />
            
            <div className="w-full md:w-64 space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Seus Ministérios</h3>
                    <ul className="space-y-2">
                        {userMinistries.map(m => (
                            <li key={m.id} className="text-sm text-gray-600 flex items-center">
                                <span className="w-2 h-2 bg-sda-gold rounded-full mr-2"></span>
                                {m.name}
                            </li>
                        ))}
                    </ul>
                </div>

                <Button onClick={handleSave} fullWidth disabled={isSaving}>
                    {isSaving ? 'Salvando...' : 'Salvar Disponibilidade'}
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};

const LeaderDashboard = () => {
  const { currentUser, ministries, users, availabilities, schedules, updateSchedule, updateMinistryImage } = useData();
  const [viewMode, setViewMode] = React.useState<'management' | 'personal'>('management');
  const [selectedMinistryId, setSelectedMinistryId] = React.useState<string | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  
  // States for Image Upload
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const ledMinistries = ministries.filter(m => currentUser?.ministryIds.includes(m.id));

  const handleMinistrySelect = (id: string) => {
    setSelectedMinistryId(id);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedMinistryId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateMinistryImage(selectedMinistryId, reader.result as string);
         // Reset input
         if(fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleScheduleMember = (memberId: string, dateStr: string) => {
    if (!selectedMinistryId) return;

    const currentSchedule = schedules.find(s => s.ministryId === selectedMinistryId && s.date === dateStr);
    let newMemberIds = currentSchedule ? [...currentSchedule.memberIds] : [];

    if (newMemberIds.includes(memberId)) {
      newMemberIds = newMemberIds.filter(id => id !== memberId);
    } else {
      newMemberIds.push(memberId);
    }

    updateSchedule({
      id: currentSchedule?.id || Math.random().toString(36).substr(2, 9),
      ministryId: selectedMinistryId,
      date: dateStr,
      memberIds: newMemberIds
    });
  };

  if (viewMode === 'personal') {
    return (
      <div className="space-y-6">
        <div className="flex justify-center mb-6">
          <div className="bg-white p-1 rounded-lg border border-gray-200 inline-flex">
            <button
              onClick={() => setViewMode('management')}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              Gerenciar Escalas
            </button>
            <button
              onClick={() => setViewMode('personal')}
              className="px-4 py-2 rounded-md text-sm font-medium bg-sda-blue text-white shadow-sm"
            >
              Minha Agenda
            </button>
          </div>
        </div>
        <MemberDashboard />
      </div>
    );
  }

  if (!selectedMinistryId) {
    return (
      <div className="space-y-6">
         <div className="flex justify-center mb-6">
          <div className="bg-white p-1 rounded-lg border border-gray-200 inline-flex">
            <button
              onClick={() => setViewMode('management')}
              className="px-4 py-2 rounded-md text-sm font-medium bg-sda-blue text-white shadow-sm"
            >
              Gerenciar Escalas
            </button>
            <button
              onClick={() => setViewMode('personal')}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              Minha Agenda
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ledMinistries.map(m => (
          <div key={m.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleMinistrySelect(m.id)}>
             <div className="h-32 bg-gray-200 relative">
               {m.imageUrl ? (
                 <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400">Sem Imagem</div>
               )}
             </div>
             <div className="p-4">
               <h3 className="font-bold text-gray-900">{m.name}</h3>
               <p className="text-sm text-gray-500">Clique para gerenciar</p>
             </div>
          </div>
        ))}
      </div>
      </div>
    );
  }

  const selectedMinistry = ministries.find(m => m.id === selectedMinistryId);
  const ministryMembers = users.filter(u => u.ministryIds.includes(selectedMinistryId) && u.role === 'member');
  const dateStr = selectedDate.toISOString().split('T')[0];
  const currentSchedule = schedules.find(s => s.ministryId === selectedMinistryId && s.date === dateStr);
  const scheduledMemberIds = currentSchedule?.memberIds || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setSelectedMinistryId(null)}>← Voltar para Ministérios</Button>
        <div className="flex items-center space-x-2">
            <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Alterar Capa
            </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            Gerenciar Escala: <span className="text-sda-blue ml-2">{selectedMinistry?.name}</span>
        </h2>
        
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
                 <label className="block text-sm font-medium text-gray-700 mb-2">Selecione a Data</label>
                 <input 
                    type="date" 
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-sda-blue focus:ring-sda-blue sm:text-sm p-2 border"
                    value={dateStr}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                 />
                 
                 <div className="mt-6 space-y-4">
                    <h3 className="font-semibold text-gray-900">Membros Disponíveis</h3>
                    {ministryMembers.length === 0 ? (
                        <p className="text-sm text-gray-500">Nenhum membro neste ministério.</p>
                    ) : (
                        <div className="space-y-2">
                            {ministryMembers.map(member => {
                                const availability = availabilities.find(a => a.userId === member.id);
                                const isAvailable = availability?.dates.includes(dateStr);
                                const isScheduled = scheduledMemberIds.includes(member.id);

                                return (
                                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                                        <div className="flex items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {isAvailable ? 'OK' : 'X'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{member.name}</p>
                                                <p className="text-xs text-gray-500">{isAvailable ? 'Disponível' : 'Indisponível'}</p>
                                            </div>
                                        </div>
                                        
                                        <Button 
                                            size="sm"
                                            variant={isScheduled ? "primary" : "outline"}
                                            onClick={() => toggleScheduleMember(member.id, dateStr)}
                                            disabled={!isAvailable && !isScheduled} // Allow unscheduling even if unavailable
                                            className={!isAvailable && !isScheduled ? 'opacity-50 cursor-not-allowed' : ''}
                                        >
                                            {isScheduled ? 'Escalado' : 'Escalar'}
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                 </div>
            </div>
            
            <div className="lg:w-1/3 bg-gray-50 p-6 rounded-xl h-fit">
                <h3 className="font-bold text-gray-900 mb-4">Resumo da Escala</h3>
                <p className="text-sm text-gray-600 mb-2">Data: {new Date(dateStr).toLocaleDateString('pt-BR')}</p>
                <p className="text-sm text-gray-600 mb-4">Total Escalados: {scheduledMemberIds.length}</p>
                
                <ul className="space-y-2">
                    {scheduledMemberIds.map(id => {
                        const member = users.find(u => u.id === id);
                        return (
                            <li key={id} className="text-sm font-medium text-sda-blue flex items-center">
                                <Check className="w-4 h-4 mr-2" />
                                {member?.name}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};
