import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';


export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useData();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Credenciais inválidas. Verifique email e senha.');
      }
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao fazer login.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative overflow-hidden">
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{ 
          backgroundImage: "url('/login-bg-new.png')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg border border-gray-100 relative z-10">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 flex items-center justify-center mb-4">
            <img src="/logo-iasd-clean.png" alt="Logo IASD" className="h-full w-full object-contain" />
          </div>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">Escala IASD</h2>
          <p className="mt-2 text-sm text-gray-600">
            Acesse sua conta para visualizar escalas
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              type="password"
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth>
            Entrar
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-500">Não tem uma conta? </span>
            <Link to="/register" className="font-medium text-sda-blue hover:text-sda-blue/80">
              Cadastre-se
            </Link>
          </div>
        </form>
      </div>
      

    </div>
  );
};
