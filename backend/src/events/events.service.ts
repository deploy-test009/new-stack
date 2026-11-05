import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(@InjectRepository(Event) private readonly repo: Repository<Event>) {}

  findAll() {
    return this.repo.find({ order: { startAt: 'ASC' } });
  }

  async findOne(id: string) {
    const event = await this.repo.findOneBy({ id });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  create(dto: CreateEventDto) {
    return this.repo.save(this.repo.create({ ...dto, startAt: new Date(dto.startAt) }));
  }

  async update(id: string, dto: UpdateEventDto) {
    const event = await this.findOne(id);
    const { startAt, ...rest } = dto;
    Object.assign(event, rest);
    if (startAt) event.startAt = new Date(startAt);
    return this.repo.save(event);
  }

  async remove(id: string) {
    const event = await this.findOne(id);
    await this.repo.remove(event);
    return { deleted: true };
  }
}
