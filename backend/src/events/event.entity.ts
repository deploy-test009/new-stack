import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column()
  venue: string;

  @Column({ type: 'timestamptz' })
  startAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
