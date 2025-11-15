package com.yigitkagankartal.finance_backend;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {

    private final TransactionRepository repository;

    public TransactionService(TransactionRepository repository) {
        this.repository = repository;
    }

    public List<Transaction> getAll() {
        return repository.findAll();
    }

    public Transaction addTransaction(Transaction transaction) {
        // Id'yi elle setlemesin, DB otomatik versin
        transaction.setId(null);
        return repository.save(transaction);
    }

    public boolean deleteById(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }

    public Optional<Transaction> getById(Long id) {
        return repository.findById(id);
    }
}
