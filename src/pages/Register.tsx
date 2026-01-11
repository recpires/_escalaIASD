
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { User, Role } from '../types';
import { Check, Shield, User as UserIcon } from 'lucide-react';

// Simple ID generator since we might not have uuid installed
const generateId = () => Math.random().toString(36).substr(2, 9);

export const Register = () => {
  const navigate = useNavigate();
  const { addUser, ministries } = useData();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member' as Role,
    ministryIds: [] as string[]
  });

  const handleMinistryToggle = (id: string) => {
    setFormData(prev => ({
      ...prev,
      ministryIds: prev.ministryIds.includes(id)
        ? prev.ministryIds.filter(mid => mid !== id)
        : [...prev.ministryIds, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.ministryIds.length === 0) {
      alert('Selecione pelo menos um ministério.');
      return;
    }

    const newUser: User = {
      id: generateId(), // This ID is largely ignored by Supabase Auth (it uses its own UUIDs) but sent for profile
      name: formData.name,
      email: formData.email,
      role: formData.role,
      ministryIds: formData.ministryIds,
      password: formData.password
    };

    try {
      await addUser(newUser);
      // login is handled automatically by signUp (if no email verification) or requires verifying email
      // We navigate to dashboard. If logic requires login, the ProtectedRoute (if exists) or Dashboard will handle it.
      // Ideally, we should wait for session to be active, but DataContext subscription handles that.
      
      // Short delay to allow subscription to fire if auto-login happened
      setTimeout(() => navigate('/dashboard'), 500); 
    } catch (error: any) {
      console.error(error);
      alert(`Erro ao criar conta: ${error.message || 'Erro desconhecido'}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Criar Conta</h2>
          <p className="mt-2 text-sm text-gray-600">
            Cadastre-se para gerenciar ou visualizar escalas
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Nome Completo"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
            />
            <Input
              label="Senha"
              type="password"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Função</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'member'})}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  formData.role === 'member' 
                    ? 'border-sda-blue bg-sda-blue/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <UserIcon className={`mb-2 ${formData.role === 'member' ? 'text-sda-blue' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${formData.role === 'member' ? 'text-sda-blue' : 'text-gray-600'}`}>Membro</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'leader'})}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  formData.role === 'leader' 
                    ? 'border-sda-blue bg-sda-blue/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Shield className={`mb-2 ${formData.role === 'leader' ? 'text-sda-blue' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${formData.role === 'leader' ? 'text-sda-blue' : 'text-gray-600'}`}>Líder</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {formData.role === 'leader' ? 'Quais ministérios você lidera?' : 'De quais ministérios você participa?'}
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {ministries.map(ministry => (
                <div 
                  key={ministry.id}
                  onClick={() => handleMinistryToggle(ministry.id)}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.ministryIds.includes(ministry.id)
                      ? 'border-sda-blue bg-sda-blue/5'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${
                    formData.ministryIds.includes(ministry.id) ? 'bg-sda-blue border-sda-blue' : 'border-gray-300'
                  }`}>
                    {formData.ministryIds.includes(ministry.id) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{ministry.name}</span>
                </div>
              ))}
            </div>
          </div>

          



          <Button type="submit" fullWidth>
            Criar Conta
          </Button>
          
          <div className="text-center text-sm">
            <span className="text-gray-500">Já tem uma conta? </span>
            <Link to="/login" className="font-medium text-sda-blue hover:text-sda-blue/80">
              Entrar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
